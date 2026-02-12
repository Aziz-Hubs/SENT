import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        "@sent/platform-ui",
        "@sent/feature-sent-msp",
        "@sent/feature-sent-erp",
        "@sent/feature-sent-sec",
        "@sent/feature-sent-core",
    ],
    turbopack: {
        root: path.resolve(__dirname, "../../.."),
    },
};

export default nextConfig;
