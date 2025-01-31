import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { CreatePaymentDTO } from "./dto/createPayment.dto";
import { PaymentEntity } from "./payment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PaymentService {
    private stripe: Stripe;
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentRepository: Repository<PaymentEntity>,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-12-18.acacia",
        });
    }

    async createPaymentIntent(args: CreatePaymentDTO) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: args.amount,
                currency: "usd",
                payment_method_types: ["card", "apple_pay", "google_pay", "link"],
                payment_method_options: {
                    link: {
                        persistent_token: "optional",
                    },
                },
                metadata: {},
            });
            const payment = this.paymentRepository.create({
                paymentIntentId: paymentIntent.id,
                amount: args.amount / 100,
                status: paymentIntent.status,
            });
            await this.paymentRepository.save(payment);
            return {
                clientSecret: paymentIntent.client_secret,
            };
        } catch (error) {
            console.error("Create Payment Intent failed.", error.message);
            throw new HttpException("Create Payment Intent Error", HttpStatus.BAD_REQUEST);
        }
    }

    async webhook(args: { sig: string; buf: Buffer }) {
        try {
            const { sig, buf } = args;
            const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
            if (!sig) throw new HttpException("Webhook Error: No signature found", HttpStatus.BAD_REQUEST);
            if (!webhookSecret)
                throw new HttpException("Webhook Error: No webhook secret found", HttpStatus.BAD_REQUEST);
            const stripeEvent = this.stripe.webhooks.constructEvent(buf, sig, webhookSecret) as Stripe.Event;
            await this.handleInvoicePaidEvent(stripeEvent);
            await this.handleInvoicePaymentFailedEvent(stripeEvent);
        } catch (error) {
            console.error("Webhook signature verification failed.", error.message);
            throw new HttpException("Webhook Error: Invalid signature", HttpStatus.BAD_REQUEST);
        }
    }

    async handleInvoicePaidEvent(stripeEvent: Stripe.Event) {
        if (stripeEvent.type === "payment_intent.succeeded") {
            try {
                const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
                const payment = await this.paymentRepository.findOne({
                    where: { paymentIntentId: paymentIntent.id },
                });
                if (payment) {
                    payment.status = "succeeded";
                    await this.paymentRepository.save(payment);
                }
            } catch (error) {
                console.error("Webhook payment succeeded Error: ", error.message);
                throw new HttpException("Webhook payment succeeded Error", HttpStatus.BAD_REQUEST);
            }
        }
    }

    async handleInvoicePaymentFailedEvent(stripeEvent: Stripe.Event) {
        if (stripeEvent.type === "payment_intent.payment_failed") {
            try {
                const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
                const payment = await this.paymentRepository.findOne({
                    where: { paymentIntentId: paymentIntent.id },
                });
                if (payment) {
                    payment.status = "failed";
                    await this.paymentRepository.save(payment);
                }
            } catch (error) {
                console.error("Webhook payment failed Error: ", error.message);
                throw new HttpException("Webhook payment failed Error", HttpStatus.BAD_REQUEST);
            }
        }
    }
}
