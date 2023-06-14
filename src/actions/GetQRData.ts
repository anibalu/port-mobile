import { generateLineBundle } from "../utils/bundles";
import { wait } from "../utils/wait";


export async function getQRData() {
    await wait(200);
    const bundle = await generateLineBundle();
    if (bundle === null) {
        return null;
    }
    return JSON.stringify(bundle);
}