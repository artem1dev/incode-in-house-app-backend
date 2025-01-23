import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PaymentModule } from "./payment/payment.module";
import { PaymentController } from "./payment/payment.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentEntity } from "./payment/payment.entity";
require('dotenv').config();

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT, 10),
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [PaymentEntity],
            synchronize: true,
            ssl: false,
        }),
        PaymentModule,
    ],
    controllers: [AppController, PaymentController],
    providers: [AppService],
})
export class AppModule {}
