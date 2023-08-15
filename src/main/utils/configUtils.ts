import {SetupModelType} from "@common/types";
import {getAppDataPath} from "@main/utils/appPath";
import {readFsSync} from "@main/utils/fsUtils";
import {isEmpty} from "lodash";
import {join} from "path";

export const APP_CONFIG_PATH = join(getAppDataPath(), 'config', 'app.json')

export const getAppSettings = async () => {
    let setting: SetupModelType
    const buffer = await readFsSync(APP_CONFIG_PATH)
    if (buffer == null || isEmpty(buffer.toString())) {
        setting = null
    } else {
        setting = JSON.parse(buffer.toString())
    }

    return setting
}
