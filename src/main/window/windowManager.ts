import {MAIN_WINDOW, UPDATER_WINDOW} from "@main/window/constants";
import {createMainWindow} from "@main/window/main.window";
import {createUpdaterWindow} from "@main/window/updater.window";

export const createWindow = () => {
    return [
        {
            name: MAIN_WINDOW,
            win: createMainWindow()
        },
/*         {
            name: UPDATER_WINDOW,
            win: createUpdaterWindow()
        } */
    ]
}
