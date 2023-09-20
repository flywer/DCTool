import {ShapeDefine, ShapeOptions} from "@antv/g6-core/lib/interface/shape";
import {NodeConfig} from "@antv/g6-core/lib/types";
import {SqlConfig} from "@common/taskSchedulerTypes";
import cube from "@render/assets/graph/cube.svg"

// 自定义节点注册类型
export type CustomNodeType = {
    shapeType: string,
    nodeDefinition: ShapeOptions | ShapeDefine,
    extendShapeType?: string
}

// 可使用的自定义节点
export const customNode = {
    jobNode: 'job-node',
    schedulerTaskNode: 'schedulerTaskNode'
}

export interface JobNodeConfig extends NodeConfig {
    jobName: string,
    // 任务类型
    jobType: '数据采集任务' | '数据质检任务' | '数据备份任务' | '数据清除任务' | '数据融合任务' | '单表融合任务' | '多表融合任务' | '数据入库任务' | '数据共享任务' | '未知任务',
    // -1:未创建； 0:采集任务未配置； 1:任务停用； 2:任务启用； 3:任务运行中； 4:任务异常； 5:任务未反馈
    jobStatus?: -1 | 0 | 1 | 2 | 3 | 4 | 5,
    // 上次执行时间
    lastExecTime?: string,
    lastExecResult?: string
}

export const jobNode: CustomNodeType = {
    shapeType: customNode.jobNode,
    nodeDefinition: {
        drawShape: function drawShape(cfg: JobNodeConfig, group) {
            let _mainColor: string
            switch (cfg.jobStatus) {
                case -1:
                    _mainColor = '#dadada'
                    break
                case 0:
                    _mainColor = '#eebb7e'
                    break
                case 1:
                    _mainColor = '#ab9999'
                    break
                case 2:
                    _mainColor = '#4ac7f4'
                    break
                case 3:
                    _mainColor = '#27e545'
                    break
                case 4:
                    _mainColor = '#F4664A'
                    break
                case 5:
                    _mainColor = '#e3a70d'
                    break
            }
            const _mainWidth = 220
            const _mainHeight = 60

            // 矩形边框弧度
            const _rectRadius = 2;

            // 绘制节点整体大小
            const shape = group.addShape('rect', {
                attrs: {
                    x: 0,
                    y: 0,
                    width: _mainWidth,
                    height: _mainHeight,
                    stroke: _mainColor,
                    radius: _rectRadius,
                },
                name: 'main-box',
                draggable: true,
            });

            // 标题栏
            group.addShape('rect', {
                attrs: {
                    x: 0,
                    y: 0,
                    width: _mainWidth,
                    height: 20,
                    fill: _mainColor,
                    radius: [_rectRadius, _rectRadius, 0, 0],
                },
                name: 'title-box',
                draggable: true,
            });

            // 左上角图标
            group.addShape('image', {
                attrs: {
                    x: 4,
                    y: 2,
                    height: 16,
                    width: 16,
                    img: cube,
                },
                name: 'node-icon',
                draggable: true,
            });

            // 标题
            group.addShape('text', {
                attrs: {
                    textBaseline: 'top',
                    y: 4,
                    x: 24,
                    fontSize: 14,
                    fontFamily: 'Microsoft PhagsPa',
                    lineHeight: 20,
                    text: cfg.jobName,
                    fill: '#fff',
                },
                name: 'title',
                draggable: true,
            });

            // 内容栏
            group.addShape('rect', {
                attrs: {
                    x: 0,
                    y: 20,
                    width: _mainWidth,
                    height: 40,
                    fill: '#fff',
                    radius: [_rectRadius, _rectRadius, 0, 0],
                },
                name: 'content-box',
                draggable: true,
            });

            // 上次执行时间
            group.addShape('text', {
                attrs: {
                    textBaseline: 'top',
                    y: 25,
                    x: 8,
                    lineHeight: 20,
                    text: `上次执行时间：${cfg.lastExecTime}`,
                    fill: 'rgba(0,0,0, 0.4)',
                },
                name: `上次执行时间`,
                draggable: true,
            });

            // 上次执行结果
            group.addShape('text', {
                attrs: {
                    textBaseline: 'top',
                    y: 42,
                    x: 8,
                    lineHeight: 20,
                    text: `上次执行结果：${cfg.lastExecResult}`,
                    fill: 'rgba(0,0,0, 0.4)',
                },
                name: `上次执行结果`,
                draggable: true,
            });

            return shape;
        },
        getAnchorPoints: function getAnchorPoints() {
            return [[0, 0.5], [0.5, 0], [0.5, 1], [1, 0.5]] // [[0, 0.5], [1, 0.5]]
        }
    },
    extendShapeType: 'single-node'
}

export interface SchedulerJobNodeConfig extends NodeConfig {
    jobName: string,
    // 任务类型
    jobType: 'dataX' | 'workflow' | 'sparkSql' | 'mysql',
    //  1:任务停用； 2:任务启用； 3:任务运行中； 4:任务异常 5：未反馈
    jobStatus: 1 | 2 | 3 | 4 | 5,
    jobId: string,
    title?: string,
    sqlConfig?: SqlConfig
}

export const schedulerTaskNode: CustomNodeType = {
    shapeType: customNode.schedulerTaskNode,
    nodeDefinition: {
        drawShape: function drawShape(cfg: SchedulerJobNodeConfig, group) {
            let _mainColor: string = '#7b86dc'
            const _mainWidth = 200
            const _mainHeight = 60

            // 矩形边框弧度
            const _rectRadius = 2;

            // 绘制节点整体大小
            const shape = group.addShape('rect', {
                attrs: {
                    x: 0,
                    y: 0,
                    width: _mainWidth,
                    height: _mainHeight,
                    stroke: _mainColor,
                    radius: _rectRadius,
                    lineWidth: 2
                },
                name: 'main-box',
                draggable: true,
            });

            // 标题栏
            group.addShape('rect', {
                attrs: {
                    x: 0,
                    y: 0,
                    width: _mainWidth,
                    height: 20,
                    fill: _mainColor,
                    radius: [_rectRadius, _rectRadius, 0, 0],
                },
                name: 'title-box',
                draggable: true,
            });

            // 左上角图标
            group.addShape('image', {
                attrs: {
                    x: 4,
                    y: 2,
                    height: 16,
                    width: 16,
                    img: cube,
                },
                name: 'node-icon',
                draggable: true,
            });

            // 标题
            group.addShape('text', {
                attrs: {
                    textBaseline: 'top',
                    y: 4,
                    x: 24,
                    fontSize: 14,
                    fontFamily: 'Microsoft PhagsPa',
                    lineHeight: 20,
                    text: cfg.title,
                    fill: '#fff',
                },
                name: 'jobType',
                draggable: true,
            });

            // 内容栏
            group.addShape('rect', {
                attrs: {
                    x: 0,
                    y: 20,
                    width: _mainWidth,
                    height: 40,
                    fill: '#fff',
                    radius: [_rectRadius, _rectRadius, 0, 0],
                },
                name: 'content-box',
                draggable: true,
            });

            // 任务名
            group.addShape('text', {
                attrs: {
                    textBaseline: 'top',
                    y: 25,
                    x: 8,
                    lineHeight: 20,
                    text: `任务名称：${cfg.jobName || '--'}`,
                    fill: 'rgba(0,0,0, 0.4)',
                    cursor: 'pointer'
                },
                name: `jobName`,
                draggable: true,
            });

            function setJobStatusText(jobStatus: number) {

                if (cfg.jobType == 'sparkSql' || cfg.jobType == 'mysql') {

                    if (typeof cfg?.sqlConfig?.isRunning == 'undefined') {
                        //启用
                        return '启用 ✔️'
                    } else {
                        if (cfg.sqlConfig.isRunning) {
                            // 运行中
                            return '运行中 🟢'
                        } else {
                            //启用
                            return '启用 ✔️'
                        }
                    }

                } else {
                    switch (jobStatus) {
                        case 1: //停用
                            return '停用 ⏹️'

                        case 2: //启用
                            return '启用 ✔️'

                        case 3: // 运行中
                            return '运行中 🟢'

                        case 4: //异常
                            return '异常 ❌'
                        case 5: //未反馈
                            return '未反馈 ⚪'
                        default:
                            return '未知 ❔'
                    }
                }
            }

            // 任务状态
            group.addShape('text', {
                attrs: {
                    textBaseline: 'top',
                    y: 42,
                    x: 8,
                    lineHeight: 20,
                    text: `任务状态：${setJobStatusText(cfg.jobStatus)}`,
                    fill: 'rgba(0,0,0, 0.4)',
                },
                name: `jobStatus`,
                draggable: true,
            });

            // 绘制锚点
            const anchorPoints = this.getAnchorPoints()
            const bbox = group.getBBox();

            anchorPoints.forEach((anchorPos: number[], i: any) => {
                group.addShape('circle', {
                    attrs: {
                        r: 6,
                        x: bbox.x + bbox.width * anchorPos[0],
                        y: bbox.y + bbox.height * anchorPos[1],
                        fill: '#fff',
                        stroke: '#5F95FF'
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                    name: `anchor-point`, // the name, for searching by group.find(ele => ele.get('name') === 'anchor-point')
                    anchorPointIdx: i, // flag the idx of the anchor-point circle
                    links: 0, // cache the number of edges connected to this shape
                    visible: false, // invisible by default, shows up when links > 1 or the node is in showAnchors state
                    draggable: true // allow to catch the drag events on this shape
                })
            })

            return shape;
        },
        getAnchorPoints: function getAnchorPoints() {
            return [[0, 0.5], [1, 0.5]]
        },
        // 响应状态变化并显示/隐藏链接点圆圈
        setState(name, value, item) {
            if (name === 'showAnchors') {
                const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
                anchorPoints.forEach(point => {
                    if (value || point.get('links') > 0) {
                        point.show()
                    } else {
                        point.hide()
                    }
                })
            }
        }

    },
    extendShapeType: 'single-node'
}
