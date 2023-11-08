import {clipboard_write_text} from "@render/api/app.api";
import useClipboard from 'vue-clipboard3';

const {toClipboard} = useClipboard();

export const copyText = async (text: string, showMsg?: boolean) => {
    try {
        await toClipboard(text);
        if (showMsg == undefined) {
            showMsg = true
        }
        if (showMsg) {
            window.$message.success('复制成功');
        }
    } catch (e) {
        console.error(e);
    }
}

export  const nativeCopyText = async (text: string, showMsg?: boolean) => {
    try {
        await clipboard_write_text(text);
        if (showMsg == undefined) {
            showMsg = true
        }
        if (showMsg) {
            window.$message.success('复制成功');
        }
    } catch (e) {
        console.error(e);
    }
}
