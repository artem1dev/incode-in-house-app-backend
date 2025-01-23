import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true });
    const globalPrefix = "api";
    app.setGlobalPrefix(globalPrefix);
    app.enableCors();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.text({ type: "text/json" }));
    app.use(bodyParser.raw({ type: "application/json" }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
