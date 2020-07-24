const fs = require('fs');
const readline = require('readline');
const format = require('date-format')
const sql = require('./config/sql.js')

/** 程序启动配置[[ */

// 每MAX_NUM条数据入库一次
const MAX_NUM = 100;
// 从第RECORD_INDEX条开始入库
const RECORD_INDEX = 1;
// trs文件路径
const TRS_FILE_PATH = './data/test.trs';

/** 程序启动配置 ]] */

// 处理工具类
class DataLoader {
    constructor () {
        this.propertiesMap = {
            "<公开（公告）号>": "id",
            "<公开（公告）日>": "public_date",
            "<申请号>": "apply_no",
            "<申请日>": "apply_date",
            "<专利号>": "patent_no",
            "<名称>": "patent_name",
            "<主分类号>": "primary_class_no",
            "<分类号>": "class_no",
            "<申请（专利权）人>": "applier",
            "<发明（设计）人>": "author",
            "<摘要>": "abstract_content",
            "<主权项>": "protect_item",
            "<优先权>": "priority_item",
            "<同族专利项>": "patent_families",
            "<国省代码>": "code",
            "<分案原申请号>": "original_no",
            "<地址>": "p_address",
            "<专利代理机构>": "agency",
            "<代理人>": "agent",
            "<审查员>": "examinant",
            "<颁证日>": "issue_date",
            "<国际申请>": "international_apply",
            "<国际公布>": "international_public",
            "<进入国家日期>": "import_date",
            "<摘要附图存储路径>": "abstract_img_path",
            "<欧洲主分类号>": "europe_primary_class_no",
            "<欧洲分类号>": "europe_class_no",
            "<本国主分类号>": "state_primary_class_no",
            "<本国分类号>": "state_class_no",
            "<发布路径>": "p_path",
            "<页数>": "page_num",
            "<申请国代码>": "country_code",
            "<专利类型>": "patent_type",
            "<申请来源>": "apply_sources",
            "<参考文献>": "p_references",
            "<范畴分类>": "category_class",
        };
        this.count = 0;
    }

    loadFileToHandle(filePath) {
        const stream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: stream,
        });
        const reg = /^(<[\s\S]+>)=([\s\S]*)/;
        let recordList = [];
        let tArr = [];

        rl.on('line', (input) => {
            if (input === '<REC>') {
                ++this.count;
                if (tArr.length > 0 && this.count >= RECORD_INDEX) {
                    recordList.push(tArr);
                    tArr = [];
                    if (recordList.length >= MAX_NUM) {
                        // 进行数据库存储
                        this.loadDataToMysql(recordList, this.count);
                        recordList = [];
                    }
                }
            } else if (input && this.count >= RECORD_INDEX){
                const res = input.match(reg);
                if (res) {
                    const key = this.propertiesMap[res[1]];
                    let value = res[2] || null;
                    if (['public_date', 'apply_date', 'issue_date', 'import_date'].includes(key) && value) {
                        value = this.parseValue(value);
                    }
                    tArr.push(value);
                }
            }
        });

        rl.on('close', (input) => {
            console.log(`数据预处理结束，一共为${this.count}条，即将载入数据库...\n`);
            recordList.push(tArr);
            tArr = [];
            this.loadDataToMysql(recordList, this.count, true);
            recordList = [];
        })
    }

    async loadDataToMysql(list, idx, isLast) {
        const sqlWord = `insert into patent(   
            id, 
            public_date, 
            apply_no, 
            apply_date, 
            patent_no,
            patent_name,
            primary_class_no,
            class_no,
            applier,
            author,
            abstract_content,
            protect_item,
            priority_item,
            patent_families,
            code,
            original_no,
            p_address,
            agency,
            agent,
            examinant,
            issue_date,
            international_apply,
            international_public,
            import_date,
            abstract_img_path,
            europe_primary_class_no,
            europe_class_no,
            state_primary_class_no,
            state_class_no,
            p_path,
            page_num,
            country_code,
            patent_type,
            apply_sources,
            p_references,
            category_class
        ) values ?`;
        const res = await sql.query(sqlWord.replace(/\n/g, ''), [list]).catch(err => {
            console.log('sql error', err);
        });
        if (isLast) {
            console.log(`sql success done, 最后一条数据已入库`);
        } else {
            console.log(`sql success done, 第${idx}条前的数据已入库`);
        }   
    }

    parseValue(val) {
        return format('yyyy-MM-dd hh:mm:ss', new Date(val));
    }
}

// 开始执行
const dataLoader = new DataLoader();
dataLoader.loadFileToHandle(TRS_FILE_PATH);
