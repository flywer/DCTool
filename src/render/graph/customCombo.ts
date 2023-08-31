import {ShapeOptions} from "@antv/g6-core/lib/interface/shape";

// 自定义分组注册类型
export type CustomComboType = {
    shapeType: string,
    comboDefinition: ShapeOptions,
    extendShapeType?: string
}

export const customCombo = {
    rectCombo: 'rect-combo'
}

const collapseIcon = (x: number, y: number, r: number) => {
    return [
        ['M', x - r, y],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x - r + 4, y],
        ['L', x - r + 2 * r - 4, y],
    ];
};
const expandIcon = (x: number, y: number, r: number) => {
    return [
        ['M', x - r, y],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x - r + 4, y],
        ['L', x - r + 2 * r - 4, y],
        ['M', x - r + r, y - r + 4],
        ['L', x, y + r - 4],
    ];
};

export const rectCombo: CustomComboType = {
    shapeType: customCombo.rectCombo,
    comboDefinition: {
        drawShape: function drawShape(cfg, group) {

            cfg.labelCfg = {
                position: 'top',
                refX: 14,
                refY: 14,
                style: {
                    fontSize: 18
                }
            }

            const self = this;
            cfg.padding = cfg.padding || [50, 20, 20, 20];
            // 获取形状的样式，其中style.width和style.height对应内置矩形组合图解中的宽度和高度
            const style = self.getShapeStyle(cfg);

            // 添加一个矩形形状作为 keyShape，与扩展的矩形组合相同
            const rect = group.addShape('rect', {
                attrs: {
                    ...style,
                    x: -style.width / 2 - (cfg.padding[3] - cfg.padding[1]) / 2,
                    y: -style.height / 2 - (cfg.padding[0] - cfg.padding[2]) / 2,
                    width: style.width,
                    height: style.height,
                },
                draggable: true,
                name: 'combo-keyShape',
            });

            // 添加右侧的圆圈
            group.addShape('marker', {
                attrs: {
                    ...style,
                    fill: '#93acff',
                    opacity: 1,
                    x: cfg.style.width / 2 + cfg.padding[1],
                    y: (cfg.padding[2] - cfg.padding[0]) / 2,
                    r: 10,
                    symbol: collapseIcon,
                },
                draggable: true,
                name: 'combo-marker-shape',
            });
            return rect;
        },
        // 定义右圆的更新逻辑
        afterUpdate: function afterUpdate(cfg, combo) {

            const group = combo.get('group');

            // 按名称在 Combo 的图形组中找到圆形形状
            const marker = group.find((ele: {
                get: (arg0: string) => string;
            }) => ele.get('name') === 'combo-marker-shape');

            // 更新右圆的位置
            marker.attr({
                x: cfg.style.width / 2 + cfg.padding[1],
                y: (cfg.padding[2] - cfg.padding[0]) / 2,
                // 组合数据中的属性“collapsed”表示组合的折叠状态
                // 根据'collapsed'更新符号
                symbol: cfg.collapsed ? expandIcon : collapseIcon,
            });
        },
        getAnchorPoints: function getAnchorPoints() {
            return [[0, 0.5], [0.5, 0], [0.5, 1], [1, 0.5]]
        }
    },
    extendShapeType: 'rect'
}
