import {ShapeOptions} from "@antv/g6-core/lib/interface/shape";

// 自定义边注册类型
export type CustomEdgeType = {
    shapeType: string,
    edgeDefinition: ShapeOptions,
    extendShapeType?: string
}

// 可使用的自定义节点
export const customEdge = {
    jobEdge: 'job-edge'
}

export const jobEdge: CustomEdgeType = {
    shapeType: customEdge.jobEdge,
    edgeDefinition: {
        draw(cfg, group) {
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;
            return group.addShape('path', {
                attrs: {
                    stroke: '#333',
                    path: [
                        ['M', startPoint.x, startPoint.y],
                        ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
                        ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
                        ['L', endPoint.x, endPoint.y],
                    ],
                },
                // 在 G6 3.3 及之后的版本中，必须指定 name，可以是任意字符串，但需要在同一个自定义元素类型中保持唯一性
                name: 'path-shape',
            });
        },
    }
}
