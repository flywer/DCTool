import {AppDataSource} from "@main/dataSource/data-source";
import {FrontSource} from "@main/dataSource/front-source";
import {ActivationKey} from "@main/entity/ActivationKey";
import {User} from "@main/entity/User";
import {getAppDataPath} from "@main/utils/appPath";
import {accountEncrypt} from "@main/utils/cryptoUtils";
import {jsonfileWrite, readFsSync} from "@main/utils/fsUtils";
import {failure, Result, success} from "@main/vo/resultVo";
import {channels} from "@render/api/channels";
import {formatDate} from "@render/utils/common/dateUtils";
import {Controller, IpcHandle, Window, IpcSend} from "einf";
import {BrowserWindow} from "electron";
import log from "electron-log";
import {isEmpty} from "lodash";
import {join} from "path";
import {MAIN_WINDOW} from "@main/window/constants";

@Controller()
export class LoginController {
    constructor(
        @Window(MAIN_WINDOW) private mainWindow: BrowserWindow, // 主窗口实例
    ) {
    }

    @IpcHandle(channels.login.signIn)
    public async handleSignIn(obj: string) {
        let result: Result

        type modelType = {
            account: string
            password: string
        }
        const model: modelType = JSON.parse(obj)

        // 判断密码是否加密
        if (!model.password.startsWith('DCT-')) {
            model.password = accountEncrypt(model.password)
        } else {
            model.password = model.password.split('-')[1]
        }

        // 1.先校验账号是否存在
        await AppDataSource.getRepository(User).findOne({
            select: ['id'],
            where: {
                account: model.account,
                isActive: 1
            }
        })
            .then(async res => {
                if (res != null) {
                    // 2.校验密码是否正确
                    await AppDataSource.getRepository(User).findOne({
                        select: ['id'],
                        where: {
                            account: model.account,
                            password: model.password
                        }
                    })
                        .then(res => {
                            if (res != null) {
                                result = success('登录成功！')
                                this.mainWindow.hide()
                                this.buildMainWindow(1208, 760).then(() => {
                                    this.handleSendCanLogin()

                                    FrontSource.initialize().then(async () => {
                                        log.info("前置机数据源连接初始化成功")
                                    }).catch(error => log.error('前置机数据源连接失败', error))

                                    setTimeout(() => {
                                        this.mainWindow.center()
                                        this.mainWindow.show()
                                    }, 1000)

                                }).catch(err => {
                                    log.error('登陆时构建主窗体失败', err)
                                })
                            } else {
                                result = failure('密码错误！')
                            }
                        })
                        .catch(error => {
                            log.error(error)
                            result = failure('系统异常')
                        })

                } else {
                    result = failure('账号不存在或被禁用！')
                }
            })
            .catch(error => {
                log.error(error)
                result = failure('系统异常')
            })

        return result
    }

    private async buildMainWindow(width: number, height: number) {
        this.mainWindow.resizable = true
        this.mainWindow.setSize(width, height, true)
    }

    @IpcSend(channels.login.sendCanLogin, MAIN_WINDOW)
    public handleSendCanLogin() {
        return true
    }

    @IpcHandle(channels.login.signUp)
    public async handleSignUp(obj: string) {

        let result: Result

        type modelType = {
            account: string
            password: string
            cdk: string
        }

        const model: modelType = JSON.parse(obj)

        // 1.查询CDK是否存在
        await AppDataSource.getRepository(ActivationKey).findOne({
            select: ['id'],
            where: {
                cdk: model.cdk,
                isUsed: 0
            }
        })
            .then(async cdk => {
                if (cdk != null) {

                    // 2.查询账号是否存在
                    await AppDataSource.getRepository(User).findOne({
                        select: ['id'],
                        where: {
                            account: model.account
                        }
                    })
                        .then(async res => {
                            if (res == null) {
                                await AppDataSource.getRepository(User).createQueryBuilder()
                                    .insert()
                                    .into(User)
                                    .values([{
                                        account: model.account,
                                        password: accountEncrypt(model.password),
                                        cdk: model.cdk,
                                        isActive: 1,
                                        createTime: formatDate(new Date())
                                    }])
                                    .execute()
                                    .then(async () => {
                                        await AppDataSource.getRepository(ActivationKey).createQueryBuilder()
                                            .update()
                                            .set({
                                                isUsed: 1,
                                            })
                                            .where("id = :id", {id: cdk.id})
                                            .execute()

                                        result = success('注册成功！')
                                    })
                                    .catch(error => {
                                        log.error(error)
                                        result = failure('系统异常')
                                    })
                            } else {
                                result = failure('账号已存在！')
                            }
                        })
                        .catch(error => {
                            log.error(error)
                            result = failure('系统异常')
                        })
                } else {
                    result = failure('激活码不存在或已被激活！')
                }
            })
            .catch(error => {
                log.error(error)
                result = failure('系统异常')
            })

        return result
    }

    @IpcHandle(channels.login.rememberMe)
    public async handleRememberMe(obj: string) {
        type modelType = {
            account: string
            password: string
            rememberMe: boolean
        }

        const model: modelType = JSON.parse(obj)

        const filePath = join(getAppDataPath(), 'config', 'user.json')

        // 判断密码是否加密
        if (!model.password.startsWith('DCT-')) {
            model.password = 'DCT-' + accountEncrypt(model.password)
        }

        const json = {
            account: model.account,
            password: model.rememberMe ? model.password : '',
            rememberMe: model.rememberMe
        }

        jsonfileWrite(filePath, json, {spaces: 2})
    }

    @IpcHandle(channels.login.readUserConfig)
    public async handleReadUserConfig() {

        let result: any

        const filePath = join(getAppDataPath(), 'config', 'user.json')
        const buffer =  readFsSync(filePath)
        if (buffer == null || isEmpty(buffer.toString())) {
            result = null
        } else {
            result = JSON.parse(buffer.toString())
        }

        return result
    }
}
