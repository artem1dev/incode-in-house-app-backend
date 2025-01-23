import { Body, Controller, Post, RawBodyRequest, Req } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDTO } from "./dto/createPayment.dto";

@Controller("payment")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post("/create")
    async createPaymentIntent(@Body() body: CreatePaymentDTO) {
        return await this.paymentService.createPaymentIntent(body);
    }

    @Post("/webhook")
    async webhook(@Req() req: RawBodyRequest<Request>) {
        const sig = req.headers["stripe-signature"] as string;
        const buf = req.rawBody as Buffer;
        return await this.paymentService.webhook({ sig, buf });
    }
}
