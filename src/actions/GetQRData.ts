import { wait } from "../utils/wait";

export async function getQRData() {
    await wait(1000);
    const bundle = {link: ""}
    return JSON.stringify(bundle);
}