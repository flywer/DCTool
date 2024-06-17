# DCTool

数据归集辅助工具

## 常用命令

```bash
# 安装依赖（install dependencies）
npm install 

# 运行 （run in developer mode）
npm run dev

# 常见问题
# 若出现报错 "Electron failed to install correctly, please delete node_modules/electron and try installing again"
# When "Electron failed to install correctly, please delete node_modules/electron and try installing again" error occurs 
electron-fix start
```

## 发布地址

- [GitHub](https://github.com/flywer/dctool-release/releases)
- [Gitee](https://gitee.com/AkeNith/dctool-release/releases)


# 数据归集操作手册



## 1.任务流程

### 1.1.数据流向图

![数据流向图](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/%E6%95%B0%E6%8D%AE%E6%B5%81%E5%90%91%E5%9B%BE.jpg)



其中包含了：

1. 数据采集：将前置机中的数据通过dataX采集到数据中台对应的表中
2. 数据质检：分为初次的简化质检与完整质检，并产生质检情况记录与报告，其中简化版质检只质检了表中的逻辑主键、业务主键、外键等等其他一些逻辑字段，即一条数据必须要有的字段属性，还质检了带值域属性的字段；完整版质检，去除了部分简化版质检部分逻辑字段的质检，更完善地将业务字段进行质检
3. 单表融合：因一次采集的数据可能会有多个批次，即通过业务主键来判断是否为同一条数据，若为同一条，批次号或者更新时间越新的则为可用数据，以此来融合这些数据，进而获取最新可用数据。同时此表结构中多出6个OPT字段来辨别此数据来自哪个单位
4. 多表融合：单表融合针对的是单部门的单业务表，那么多表融合就是将这些表在此进行融合
5. 数据入湖：以全量覆写的方式将数据写入到数据湖对应表中
6. 数据共享：以全量覆写的方式将数据写入到共享库对应表中
7. 数据备份：将每次采集且质检过的数据进行备份存入另一个表中，目前的作用是计算数据的合规率
8. 数据清除：一般为在执行备份任务与质检任务后清除临时表数据

执行顺序一般为：数据采集-->数据质检-->数据备份-->数据清除-->单表融合-->多表融合-->数据入库(入湖)-->(数据湖质检)-->数据共享

### 1.2.数据处理流程

数据处理流程因数据类型的不同而分为基础数据与行为数据，不同点在于及基础数据不需要进行多表融合这一步

这里解释一下这些表名的后缀的含义

1. temp_ods：ODS层临时表，ODS层即原始数据层
2. ods：ODS层备份表，也是这一层完整数据表
3. right_dwd：DWD层合格表，DWD层即数据明细层
4. error_dwd：DWD层不合格表
5. dwb：DWB层融合表，DWB层即基础数据层
6. dm：DM层集市表，DM层即数据集市表

#### 1.2.基础数据处理流程

![页-2](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/%E9%A1%B5-2.jpg)

#### 1.3.行为数据处理流程

![行为数据流程](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/%E8%A1%8C%E4%B8%BA%E6%95%B0%E6%8D%AE%E6%B5%81%E7%A8%8B.jpg)

## 2.项目管理

所创建任务都需要一个项目来管理，在开始进行数据归集之前，我们要先创建这个项目

### 2.1.项目创建

1. 数据采集-->项目管理-->新增

   项目根据具体数源单位（在[数据订阅情况文档](https://www.kdocs.cn/l/cff65AQ7NWSh)中查看）命名，省直单位加”数据归集后缀“，如”广东省公安厅数据归集“；地市加”行政行为数据归集“后缀，如”佛山市行政行为数据归集“
   
   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801152429348.png" alt="image-20230801152429348" style="zoom:67%;" />

### 2.2.项目维护

1. 在中台提交表单，创建完毕后，进入工具的“项目简称”，其中会自动生成一行你所创建的项目，在这里维护你新创建的出来的项目，其中：

   - 项目简称：当你创建此项目的中的任务时，任务名的前缀会用到，且不可与其他项目同名
   - 表名简称：当你为此项目创建表时，表名的前缀会用到，且不可与其他项目同名
   
   值得注意的是，为省直创建的项目，项目简称默认从”省“开始简称，即不需要”广东“的简称，比如广东省司法厅为ssft；为地市创建的项目我们会默认为其项目简称追加一个xzxw（行政行为），比如茂名市为mmsxzxw；表名简称则不需要如此处理
   
   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801152613130.png" alt="image-20230801152613130" style="zoom:67%;" />

## 3.建表

### 3.1.方法一：中台建表

1. 数据治理-->可视化建表-->数据中台(TBDS)-->新增

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801113503149.png" alt="image-20230801113503149" style="zoom: 67%;" />

2. 填写表单

   - 数据生命周期：选择“永久”
   - 更新方式：根据此表具体使用方式来选择，一般为“全量”或“增量”
   - 组织机构：根据具体项目选择
   - 数据层级：根据此表具体使用方式来选择

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801113751091.png" alt="image-20230801113751091" style="zoom: 67%;" />

   选择项可在基础管理-->命名规范中配置

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801115033745.png" alt="image-20230801115033745" style="zoom:67%;" />

3. 填写建表SQL语句，注意此为Hive-SQL，且有些特殊，若由mysql语句转为此语句，需注意以下几点：

   1. 不可配置主键primary key
   2. 不可为字段配置null或者not null属性
   3. text类型转为string类型
   4. datetime类型转为timestamp类型
   5. decimal类型转为string类型
   6. 建表结尾需带`ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC`

   示例：

   ```
   (
       ID INT COMMENT '标识ID',
       C201100 VARCHAR(50) COMMENT '主键ID',
       C201000 VARCHAR(50) COMMENT '行政处罚基本信息主键ID',
       C201101 TIMESTAMP COMMENT '立案批准日期',
       C201102 VARCHAR(50) COMMENT '立案/不予立案文书号',
       C201103 VARCHAR(1000) COMMENT '立案/不予立案呈批表',
       C201104 VARCHAR(200) COMMENT '数据编目挂接单位名称',
       C201105 VARCHAR(20) COMMENT '数据编目挂接单位统一社会信用代码',
       C201106 VARCHAR(9) COMMENT '数据编目挂接单位行政区划',
       add_time TIMESTAMP COMMENT '创建时间',
       cd_time TIMESTAMP COMMENT '变更时间',
       cd_operation VARCHAR(1) COMMENT '增量标识',
       cd_batch VARCHAR(50) COMMENT '批次号'
   )
       COMMENT '行政处罚案件立案信息' ROW FORMAT DELIMITED FIELDS TERMINATED BY '|' STORED AS ORC
   ```

   如果mysql的建表语句是由DataGrip自动生成的，可以在工具的SQL处理-->SQL转换中直接转为可使用的建表SQL

4. 点击“保存”

### 3.2.方法二：工具建表

1. 点击“中台建表”

   ![image-20230801120411446](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801120411446.png)

2. 选择要创建的表与项目，并勾选要创建的表，只有少部分基础数据表不需要OPT字段（法律法规数据等），其余的皆需要

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801120510606.png" alt="image-20230801120510606" style="zoom: 67%;" />

3. 点击“创建表”。若有些表执行失败，则点击“删除重建”

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801120842104.png" alt="image-20230801120842104" style="zoom:67%;" />

## 4.数据采集

### 4.1.采集任务创建

#### 4.1.1.方法一：中台创建

1. 数据采集-->大数据采集-->新增

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801141112244.png" alt="image-20230801141112244"  />

2. 采集任务一般皆为“前置机”至“数据中台”的增量采集任务

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801142235839.png" alt="image-20230801142235839" style="zoom:67%;" />

3. 来源表需在[数据订阅情况文档](https://www.kdocs.cn/l/cff65AQ7NWSh)中查看订阅在前置机的待采集的单位的数据表名

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801142535344.png" alt="image-20230801142535344" style="zoom:67%;" />

4. 字段映射，一般情况，前置机的来源表与中台的写入表的表字段相同，可直接同名映射。若来源表的字段不同名，即使数据正确，也要反馈让数源单位修改表结构，重新上传

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801142711991.png" alt="image-20230801142711991" style="zoom:50%;" />

5. 任务名注意写法：`cj_项目简称_业务表名`，“采集来源”可以随便选，这里选择“业务系统库”，“是否生成对账”选“否”

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801143006586.png" alt="image-20230801143006586" style="zoom: 67%;" />

6. 最后点击“保存”



**增量任务配置**

1. reader的数据过滤需设置为

   ```
   cd_time >= ${lastTime} and cd_time < ${currentTime}
   ```

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230420111710628.png" alt="image-20230420111710628" style="zoom:67%;" />

2. 当增量采集方式设置为时间自增时，增量开始时间需设置为`1971-01-01 00:00:00`，增量时间字段为`-DlastTime='%s' -DcurrentTime='%s'`,增量时间格式为`yyyy-MM-dd HH:mm:ss`

   ![image-20230804091903104](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230804091903104.png)


**TBDS配置**

1. 字段分隔符：|
2. 文件类型：orc
3. 文件名称：与表名相同
4. 节点地址：hdfs://173.76.2.222:8020
5. 文件储存路径：/apps/hive/warehouse/xzzf_ods.db/表名

<img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/202303241144105.png" alt="image-20230324114431024" style="zoom:67%;" />

#### 4.1.2.方法二：工具创建1

1. 任务创建-->采集任务

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801143626931.png" alt="image-20230801143626931" style="zoom:67%;" />

2. 先输入要创建的表名，例如c2010,再选择相应的项目，再去[数据订阅情况文档](https://www.kdocs.cn/l/cff65AQ7NWSh)中找到要采集的来源表，然后点击”JSON生成“。若提示没有目标表，则先去创建

   也可在此选择“同时创建调度任务”，同时将此采集任务调度配置一起创建

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801144210240.png" alt="image-20230801144210240" style="zoom: 67%;" />

3. 最后点击“执行”，创建任务到中台

#### 4.1.3.方法三：工具创建2

1. 任务管理中，选择待建的项目的业务表，这里示例为交通厅的C2051

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801144448235.png" alt="image-20230801144448235" style="zoom:67%;" />

2. 点击数据采集任务后面的“创建”，输入来源表名

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801144526215.png" alt="image-20230801144526215" style="zoom:67%;" />

3. 点击“创建”即可

### 4.2.采集调度配置

创建的采集任务，若未进行调度配置，仍无法运行

#### 4.2.1.方法一：中台创建

1. 数据采集-->调度列表-->新增

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801150041110.png" alt="image-20230801150041110" style="zoom: 67%;" />

2. “调度内容”选择创建的采集任务，非必填项都可以不填

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801150334179.png" alt="image-20230801150334179" style="zoom: 67%;" />

3. 调度时间配置要注意的是同一小时的同一分钟内只能配置10个任务，所以需要注意此时间是否与其他项目配置的时间产生冲突，“时”一般为12小时执行一次，即0,12、1,13等等

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801150556709.png" alt="image-20230801150556709" style="zoom:67%;" />

4. 最后点击“提交”

#### 4.2.2.方法二：工具创建

1. 任务管理中，选择待建的项目的业务表，这里示例为交通厅的C2060，点击”配置“

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801151046063.png" alt="image-20230801151046063" style="zoom:67%;" />

2. 在此配置即可

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801151120686.png" alt="image-20230801151120686" style="zoom:67%;" />

3. 若出现黄色提示，需前往调度管理进行配置

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801151313517.png" alt="image-20230801151313517" style="zoom:67%;" />

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230801151330513.png" alt="image-20230801151330513" style="zoom:67%;" />

### 4.3.任务运行

任务运行分为两种：

1. 直接运行：点击执行按钮，立即执行
2. 调度运行：点击启动按钮，会下次执行时间执行

#### 4.3.1.方法一：中台启动与执行

<img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803105258278.png" alt="image-20230803105258278" style="zoom:67%;" />

#### 4.3.2.方法二：工具启动与执行

<img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803105430363.png" alt="image-20230803105430363" style="zoom:67%;" />

## 5.数据质检

数据质检分为简化版质检与完整版质检，除了规则不同，具体操作是一样的

### 5.1.简化版质检

简化质检是在采集数据后进行的第一次质检，通常质检了以下几类数据：

1. id字段，即逻辑主键
2. 业务主键，比如C2010表中的c201000字段
3. 外键，比如C2020表中的c201000字段
4. 值域
5. 自定义sql中质检了值域；质检的自定义sql不同于完整版质检，比如完整版规则中，这个值是必填项，即必须符合值域，但是在简化版中这个值可以为NULL，只有当不为NULL的时候才需符合值域
6. add_time、cd_time、cd_operation、cd_batch字段，这是一条数据必须有的几个属性
7. 中台自身的校验规则，比如身份证号、手机号、邮箱等
8. 自定义的正则表达式
9. 自定义sql中包含中台其他表的规则，这是因为这一步无法在完整版质检（数据湖）中质检到，tdsql无法访读取到中台的表，所以在这里质检

除了以上数据，其他字段皆做非必填处理，具体规则查看附件中的《数据质检规则表_简化版》

### 5.2.完整版质检

完整质检是对数据湖中的数据进行质检，这里质检主要是对业务字段进行质检，简化质检质检过的，我们这里就不用再次质检，但是简化质检第五条因为规则不同，所以仍需根据完整版规则质检

具体规则查看附件中的《数据质检规则表_完整版》

### 5.3.任务创建

需要注意这里创建的任务皆是没有配置调度的，因为目前（23年8月3日）中台调度有问题

#### 5.3.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称、项目、责任人是必填项，工作流名称注意写法：`zj_项目简称_业务表名`

   这是中台表质检的工作流画布排法，需要注意三张数据表需要提前创建，即temp_ods表、right_dwd表、error_dwd表

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803101207073.png" alt="image-20230803101207073" style="zoom: 67%;" />

3. 连接完毕后，双击数据质检节点图标，数据存储：合规数据选择right_dwd表，不合规数据选择error_dwd表

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803102031597.png" alt="image-20230803102031597" style="zoom:67%;" />

4. 规则配置我们需根据《数据质检规则表》中的规则对字段进行规则配置

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803102720387.png" alt="image-20230803102720387" style="zoom: 67%;" />

5. 在这里选择规则

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803102818406.png" alt="image-20230803102818406" style="zoom: 67%;" />

   现列一些常用的质检配置

   1. 长度：准确性-->最大/最小长度质检
   2. 必填项：完整性-->空值质检
   3. 外键：一致性-->主外键一致性质检
   4. 值域：准确性-->值域质检
   5. 正则：准确性-->正则质检
   6. 自定义SQL：准确性-->自定义质检

   需要注意的是自定义SQL中的SQL是**查询出不符合质检规则的数据**，所以需要注意SQL写法，比如G101008的值需大于'1949-01-01'，那么SQL写法为`WHERE G101008 < '1949-01-01'  OR G101008 IS NULL`

6. 将所有需要配置的规则配置完毕后，点击保存即可

#### 5.3.1.方法二：工具创建

1. 选择数源单位，再选择对应业务表，点击创建

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803104303156.png" alt="image-20230803104303156" style="zoom:67%;" />

2. 选择简化版质检

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803104330014.png" alt="image-20230803104330014" style="zoom:67%;" />

3. 点击“创建”即可

### 5.4.组织机构创建

任务运行前，需要再质量门户先将待质检的表配置到对应的组织机构（一般与数源单位同名），若组织机构不存在，则需创建

<img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803105807696.png" alt="image-20230803105807696" style="zoom:67%;" />

1. 使用admin账号登录http://19.15.97.242:30080/admin/login

2. 组织机构-->新增

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803110511647.png" alt="image-20230803110511647" style="zoom:67%;" />

3. 表单填写的特殊规则如下：

   1. 机构编码填写机构的统一社会信用代码
   2. 机构类型选择“单位”
   3. 机构级别、机构区域如实填写
   4. 上级机构选择”顶级机构“
   5. 机构来源填写”手动创建“
   6. 排序号随意
   7. 统一社会信用代码可以去[天眼查](https://www.tianyancha.com/)网站查询，若为地市，则去[数据订阅情况文档](https://www.kdocs.cn/l/cff65AQ7NWSh)查看对应表的网址一项，进入到一网共享平台，查看数源单位，可用此单位的统一社会信用代码

      <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230804101235024.png" alt="image-20230804101235024" style="zoom:67%;" />

      <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230804101309091.png" alt="image-20230804101309091" style="zoom:67%;" />

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803110705683.png" style="zoom: 80%;" />

4. 点击”保存“

5. 角色管理-->业务角色-->点击”北大软件“的编辑按钮

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803111026842.png" alt="image-20230803111026842" style="zoom:67%;" />

6. 选择”数据权限“，在区划列表中找到刚创建的新机构，勾选，点击保存

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803111220085.png" alt="image-20230803111220085" style="zoom:67%;" />

7. 重新使用自己的账号登陆数据中台即可，若使用辅助工具，还需继续操作

8. 点击F12进开发者模式，随意请求一个页面或者列表，在右侧请求头里找到Authorization，复制bearer后那串字符

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803111553111.png" alt="image-20230803111553111"  />

9. 进入到工具，进入应用设置，将刚复制的字符串粘贴到这里，然后重启应用，工具才可配置此机构

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803111657379.png" alt="image-20230803111657379" style="zoom:50%;" />

### 5.5.任务组织机构配置

如5.4所述，如果任务质检情况需在质量门户展示，则需要配置组织机构

#### 5.5.1.方法一：中台配置

1. 质量门户-->配置管理-->新增

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803114126716.png" alt="image-20230803114126716" style="zoom:67%;" />

2. 根据待质检表的实际情况选择数据库，并输入该表名，主键字段选择业务主键，批次号字段为：cd_batch

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/20230803114002.png" style="zoom:67%;" />

3. 点击”确定“即可

#### 5.5.2.方法二：工具配置

1. 选择数源单位，再选择对应业务表，点击配置管理

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803114329777.png" alt="image-20230803114329777" style="zoom:67%;" />

2. 选择对应机构，点击”保存“即可

### 5.6.任务运行

#### 5.6.1.方法一：中台运行

1. 若项目当前状态为停用，则先启用

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803115322805.png" alt="image-20230803115322805" style="zoom:67%;" />

2. 点击”查看“

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803115352739.png" alt="image-20230803115352739" style="zoom:67%;" />

3. 点击”运行“或”重跑“，

   重跑分两种调度方式：

   1. 重新运行：删除之前的运行记录日志，重新执行
   2. 继续运行：不删除之前的运行记录日志，重新执行，建议用这个

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803115442213.png" alt="image-20230803115442213" style="zoom:67%;" />

#### 5.6.2.方法二：工具运行

1. 找到要执行的任务，点击”执行“，即使任务处于停用，也会先启用再执行

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803115652631.png" alt="image-20230803115652631" style="zoom:67%;" />

## 6.单表融合

### 6.1.任务创建

#### 6.1.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称注意写法：`rh1_项目简称_业务表名`，工作流画布中需要注意的是根据SQL的写法，将所用到的所有表都列胡来，下图是常规任务会用到的表，最好是先在其他编辑器写好SQL，再到这里连线，如果先在数据开发节点里写SQL，再连线可能会导致SQL被清除

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803142013548.png" alt="image-20230803142013548" style="zoom:50%;" />

3. 写入模式选择overwrite，如下图所示，需要注意的地方是：

   1. 标为“1”处的SQL的含义是自查询出业务主键为主的最新的数据
   2. 标为“2”处的SQL的含义是关联查询填补6个OPT字段，也就是主体部门信息
   3. 标为“3”处的SQL的含义是插入dwb表中数据的业务主键不存在于right_dwd表的旧数据
   4. 如果说此业务表无法关联主体，也就是标为“2”处，那么此表需要先关联主表然后再去关联主体，比如c2020表，需先关联c2010的业务ID，再用c2010的主体ID去关联主体信息z2020表

   ![image-20230803142449475](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803142449475.png)

   ```sql
   INSERT INTO
     df_skxjst_c6030_dwb
   SELECT
     t1.id,
     t1.C603000,
     t1.Z202000,
     t1.C603001,
     t1.C603002,
     t1.C603002_1,
     t1.C603003,
     t1.C603004,
     t1.C603005,
     t1.F101001,
     t1.F101003,
     t1.C603006,
     t1.C603007,
     t1.C603008,
     t1.C603009,
     t1.C603010,
     t1.C603011,
     t1.add_time,
     t1.cd_time,
     t1.cd_operation,
     t1.cd_batch,
     z2010.Z201013 AS OPT_AREA_CODE,
     z2010.Z201012 AS OPT_FIELD_CODE,
     z2020.Z202000 AS OPT_SUBJECT_ID,
     z2020.Z202001 AS OPT_SUBJECT_NAME,
     z2010.Z201000 AS OPT_DEPT_ID,
     z2010.Z201001 as OPT_DEPT_NAME
   FROM
     di_skxjst_c6030_right_dwd t1
     INNER JOIN (
       SELECT
         C603000,
         MAX(cd_time) AS max_cd_time
       FROM
         di_skxjst_c6030_right_dwd
       GROUP BY
         C603000
     ) t2 ON t1.C603000 = t2.C603000
     AND t1.cd_time = t2.max_cd_time
     INNER JOIN df_ssft_z2020_dwb z2020 ON z2020.Z202000 = t1.Z202000
     INNER JOIN df_ssft_z2010_dwb z2010 ON z2020.Z201000 = z2010.Z201000
   UNION ALL
   SELECT
     t1.*
   FROM
     df_skxjst_c6030_dwb t1
     LEFT JOIN (
       SELECT
         C603000
       FROM
         di_skxjst_c6030_right_dwd
       GROUP BY
         C603000
     ) t2 ON t1.C603000 = t2.C603000
   WHERE
     t2.C603000 IS NULL
   ```

4. 最后点击”保存“即可

#### 6.1.2.方法二：工具创建

1. 选择数源单位，再选择对应业务表，点击创建即可

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803143418240.png" alt="image-20230803143418240" style="zoom: 67%;" />

## 7.多表融合

### 7.1.任务创建

#### 7.1.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称注意写法：`rh2_项目简称_业务表名`，工作流画布中，为dwb表与dm表到dm表，中间为数据开发（SparkSQL）节点

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803154518524.png" alt="image-20230803154518524" style="zoom:50%;" />

3. 双击数据开发节点，填写SQL，这里SQL需要注意的是这里的SQL的原理是根据一个唯一ID将这次的新数据覆盖到dm表中，因为各单位数据再dm表皆存在，可能会存在业务主键相同的情况，那么我们选用的唯一ID是将业务主键ID、主体ID、部门ID拼接起来的新ID，来查询dm表中的旧数据

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803154627291.png" alt="image-20230803154627291" style="zoom:67%;" />

4. 点击“保存”即可

#### 7.1.2.方法二：工具创建

1. 选择数源单位，再选择对应业务表，点击创建即可

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803154949603.png" alt="image-20230803154949603" style="zoom:50%;" />

## 8.数据备份

### 8.1.任务创建

#### 8.1.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称注意写法：`bf_项目简称_业务表名`，工作流画布的画法，中间为数据开发（SparkSQL）节点

   ![image-20230803161717145](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803161717145.png)

3. 双击数据开发节点，写入模式选择append，SQL则为一个全量插入insert语句

   ![image-20230803161846434](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803161846434.png)

4. 点击“保存”即可

#### 8.1.2.方法二：工具创建

1. 选择数源单位，再选择对应业务表，点击创建即可

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803162255844.png" alt="image-20230803162255844" style="zoom:67%;" />

## 9.临时数据清除

### 9.1.任务创建

#### 9.1.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称注意写法：`qc_项目简称_业务表名`,工作流画布中需要注意的是，两张表皆为temp_ods表，中间为数据开发（SparkSQL）节点

   ![image-20230803162803776](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803162803776.png)

3. 双击数据开发节点，写入模式选择overwrite，SQL是一个查询结果为空的语句，以此来达到清除原表的目的

   ![image-20230803162953820](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803162953820.png)

4. 点击“保存”即可

#### 9.1.2.方法二：工具创建

1. 选择数源单位，再选择对应业务表，点击创建即可

   ![image-20230803163031730](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803163031730.png)

## 10.行为数据入湖

dm层的行为数据需要入数据湖进行第二次质检

### 10.1.任务创建

#### 10.1.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称注意写法：`rk_xzxw_业务表名`，工作流画布中，dm表则为多表融合后的集市表，通过数据开发（SparkSQL）节点，将数据传入到数据湖中对应的表中

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803155326037.png" alt="image-20230803155326037" style="zoom:67%;" />

3. 双击数据开发节点，写入模式为overwrite，这里的SQL很简单，是一个全量的插入语句，只需要注意不要带id字段进去，因为这里的dm表的id不是唯一的，可以让数据库自动为数据湖的表生成自增ID（前提是数据湖以为id字段设置自增属性）

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803155625194.png" alt="image-20230803155625194" style="zoom:67%;" />

4. 点击“保存”即可

#### 10.1.2.方法一：工具创建

1. 任务创建-->入库任务

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803155804453.png" alt="image-20230803155804453" style="zoom: 67%;" />

2. 数据类型选择行为数据，输入将要入湖的业务表名，比如c1010，然后选择责任人，点击SQL生成

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803155905965.png" alt="image-20230803155905965" style="zoom:67%;" />

3. 查看SQL是否有问题，无问题则点击“创建任务”按钮即可

4. 然后在任务管理-->行为数据入湖-->任务列表中即可找到你创建的任务

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803160018775.png" alt="image-20230803160018775" style="zoom: 67%;" />

## 11.数据湖质检

具体任务的创建可参考上文5.3数据质检的操作流程，需要注意的是工作流画布的画法与工作流名称注意写法：`zj_lake_业务表名`

<img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803163618404.png" alt="image-20230803163618404" style="zoom:67%;" />

其中数据湖与主题库表同名，中台错误数据表的表名规定为df_lake_xxx_error_dm，xxx即为业务表名，比如c1010

质检规则如5.2所述

### 11.1.工具创建

1. 任务管理-->数据湖质检-->创建任务

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803165200936.png" alt="image-20230803165200936" style="zoom:67%;" />

2. 选择表名与责任人

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803165254500.png" alt="image-20230803165254500" style="zoom:67%;" />

3. 点击“确定”即可

### 11.2.任务配置

#### 11.2.1.方法一：中台配置

1. 质量门户-->配置管理-->新增

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803114126716.png" alt="image-20230803114126716" style="zoom:67%;" />

2. 数据库选择数据湖，机构选择广东省司法厅，其余与5.5中类似

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230804154436507.png" alt="image-20230804154436507" style="zoom: 67%;" />

3. 点击“确定”即可

#### 11.2.2.方法一：工具配置

1. 创建完任务后，点击“配置”

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230804154532779.png" alt="image-20230804154532779" style="zoom:67%;" />

2. 机构选择广东省司法厅

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230804154605304.png" alt="image-20230804154605304" style="zoom:67%;" />

3. 点击“确定”即可

## 12.基础数据入库

基础数据入库与行为数据入湖类似，只不过对应表变了

### 12.1.任务创建

#### 12.1.1.方法一：中台创建

1. 数据开发-->新增工作流

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803100848583.png" alt="image-20230803100848583" style="zoom:67%;" />

2. 工作流名称注意写法：`rk_项目简称_业务表名`，工作流画布中，dwb表则为单表融合后表，通过数据开发（SparkSQL）节点，将数据传入到主题库中对应的表中

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803164739997.png" alt="image-20230803164739997" style="zoom:67%;" />

3. 双击数据开发节点，写入模式为overwrite，这里的SQL很简单，是一个全量的插入语句，只需要注意不要带id字段进去，因为这里的dwb表的id不是唯一的，可以让数据库自动为主题库的表生成自增ID（前提是主题库以为id字段设置自增属性）

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803164822869.png" alt="image-20230803164822869" style="zoom:67%;" />

4. 点击“保存”即可

#### 12.1.1.方法二：工具创建

1. 选择数源单位，再选择对应业务表，点击创建即可

   <img src="https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803165022220.png" alt="image-20230803165022220" style="zoom:67%;" />

## 13.数据共享

数据共享任务的本质是一个采集任务，即从主题库全量采集数据到共享库

### 13.1.通用任务创建

这种方法，基础与行为数据的共享任务都可以创建

1. 数据采集-->大数据采集-->新增

   ![image-20230803170453480](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803170453480.png)

2. 主题库的表为sztk\_开头，共享库的为gdsztk\_开头;需要注意的是前置SQL的`truncate table`语句

   ![image-20230803174730715](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803174730715.png)

3. 采集方式为全量

   ![image-20230803175008879](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803175008879.png)

4. 点击“保存”即可

### 13.2.工具创建

#### 13.2.1.基础数据

1. 选择数源单位，再选择对应业务表，点击创建即可

   ![image-20230803175611496](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803175611496.png)

#### 13.2.2.行为数据

1. 任务创建-->共享任务

   ![image-20230803175657291](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803175657291.png)

2. 数据类型选择行为数据，输入业务表名，比如c1010，点击JSON生成

   ![image-20230803175742202](https://pic-bed-1307818467.cos.ap-guangzhou.myqcloud.com/img/image-20230803175742202.png)

3. 点击“执行”即可创建任务
