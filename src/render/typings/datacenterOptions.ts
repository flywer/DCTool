// 项目
export const projectIdOptions = [
    {
        id: '3',
        name: '数据采集',
        abbr: 'sjcj'
    },
    {
        id: '4',
        name: '许可数据迁移',
        abbr: 'xkqy'
    },
    {
        id: '5',
        name: '广东省市场监督管理局数据归集',
        abbr: 'sscjgj'
    },
    {
        id: '6',
        name: '广东省司法厅数据归集',
        abbr: 'ssft'
    },
    {
        id: '8',
        name: '广东省科学技术厅数据归集',
        abbr: 'gdskxjst'
    }
].map(
    (v) => ({
        label: v.name,
        value: v.id,
        abbr: v.abbr
    })
)

// 负责人
export const personIdOptions = [
    {
        id: '1649250175324086274',
        name: '王成博'
    },
    {
        id: '1649250838376439810',
        name: '张伟东'
    },
    {
        id: '1649251154287222786',
        name: '刘远'
    },
].map(
    (v) => ({
        label: v.name,
        value: v.id
    })
)
