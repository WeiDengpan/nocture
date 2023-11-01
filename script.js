"ui";
function beganToRun() {
    threads.start(function () {
        let url = "http://api2.muketool.com/v1/cxexam"
        let TmType = ['单选题', '多选题', '填空题', '判断题']
        let error = '接口拥堵，错误码【10003】，如需了解详细情况及解决方法请打开网页 http://www.muketool.com 查看'
        let errorOptions = ['A', 'B', 'C', 'D'];
        let judgeOptions = {
            correct: ['正确', '√', '对', '是'],
            error: ['错误', '×', '错', '否'],
        }
        // 无分隔符遍历选择
        function traverseStr(str) {
            let arr = str.split('');
            let newArr = []
            let newStr = ''
            arr.forEach(item => {
                newStr += item
                if (className("android.view.View").text(newStr).exists()) {
                    newArr.push(newStr)
                    newStr = ''
                }
            })
            newArr.length != 0 ? chooseAnswer(newArr.join(';'), getTmType()) : toast(str)
        }
        // 获取题目类型
        function getTmType() {
            for (let i = 0; i < TmType.length; i++) {
                if (className("android.view.View").textContains(TmType[i]).exists()) {
                    return TmType[i]
                }
            }
        }
        // 选择答案
        function chooseAnswer(text, TimuType) {
            switch (TimuType) {
                // 单选题
                case TmType[0]:
                    if (className("android.view.View").text(text).exists()) {
                        let controls = className("android.view.View").text(text).findOne().bounds();
                        console.log(controls)
                        click(controls.centerX(), controls.centerY());
                    } else {
                        toast(text)
                    }
                    break;
                // 多选题
                case TmType[1]:
                    let options = text.split('---').length > 1 ? text.split('---') : text.split(';')
                    for (let i = 0; i < options.length; i++) {
                        if (className("android.view.View").text(options[i]).exists()) {
                            let controls = className("android.view.View").text(options[i]).findOne().bounds()
                            click(controls.centerX(), controls.centerY())
                        } else {
                            traverseStr(text)
                        }
                    };
                    break;
                // 填空题
                case TmType[2]:
                    let input = className("android.widget.EditText").untilFind();
                    let optionArr = text.split('---').length > 1 ? text.split('---') : text.split(';')
                    if (input.length > 1) {
                        for (let i = 0; i < input.length; i++) {
                            input[i].setText(optionArr[i])
                        }
                    } else {
                        className("android.widget.EditText").setText(text)
                    }
                    break;
                // 判断题
                case TmType[3]:
                    let answerType = true
                    // 正确循环
                    judgeOptions.correct.forEach(item => {
                        if (text == item) {
                            if (className("android.view.View").text('对').exists()) {
                                let controls = className("android.view.View").text('对').findOne().bounds();
                                click(controls.centerX(), controls.centerY());
                                answerType = false
                            }
                        }
                    })
                    // 错误循环
                    judgeOptions.error.forEach(item => {
                        if (text == item) {
                            if (className("android.view.View").text('错').exists()) {
                                let controls = className("android.view.View").text('错').findOne().bounds();
                                click(controls.centerX(), controls.centerY());
                                answerType = false
                            }
                        }
                    });
                    answerType ? toast(text) : '';
                    break;
            }
        }
        // 获取题目答案
        function getAnswer() {
            let list = className("android.view.View").textContains(getTmType()).findOne().parent()
            let str = '';
            for (let i = 0; i < list.childCount(); i++) {
                let child = list.child(i);
                str += child.text();
            }

            let newStr = str.split('.')[str.split('.').length == 2 ? 1 : 2];
            let res = http.post(url, {
                "question": newStr,
                "type": 0,
                "id": 0
            });
            let html = res.body.string();
            if (JSON.parse(html).code == '-1') {
                toast('请重试')
            } else if (JSON.parse(html).code == '1') {
                console.log(JSON.parse(html).data, getTmType())
                if (JSON.parse(html).data != error) {
                    chooseAnswer(JSON.parse(html).data, getTmType())
                } else {
                    toast('接口拥堵')
                }
            }
        }
        events.setKeyInterceptionEnabled("volume_down", true);
        events.observeKey();
        events.onKeyDown("volume_down", () => {
            getAnswer()
        });
        setInterval(function () {
            console.log('In the run!');
        }, 50000)
        home();
        toast('脚本运行成功')
    });
}
var color = "#009688";
ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" />
            </appbar>
            <frame w="*" h="*">
                <vertical>
                    <vertical gravity="center">
                        <card w="*" h="140" margin="10 5" cardCornerRadius="2dp" cardElevation="1dp" foreground="?selectableItemBackground">
                            <horizontal>
                                <View bg="#1495E7" h="*" w="5" />
                                <vertical padding="10 15" h="*" w="0" layout_weight="1">
                                    <horizontal>
                                        <Switch id="autoService" text="自动选择" checked="{{auto.service != null}}" padding="8 8 8 8" textSize="20" />
                                    </horizontal>
                                </vertical>
                            </horizontal>
                            <horizontal padding="25 60 0 0">
                                <text text="建议开启此功能，若选项内无匹配答案，则会采用toast消息框提示答案。" />
                            </horizontal>
                        </card>
                        <card gravity="center" marginTop="30xp" w="auto" h="auto" cardCornerRadius="50" >
                            <vertical gravity="center" bg="#03A6EF">
                                <text padding="10 5 10 5" color="#ffffff" text="小提示" />
                            </vertical>
                        </card>
                    </vertical>
                    <card w="*" cardCornerRadius="10" gravity="center" marginTop="30" padding="10">
                        <vertical>
                            <horizontal padding="10">
                                <text padding="10 0 0 0" text="1：" />
                                <text text="脚本运行后,进入考试页面手动按下“音量-”键即可自动选择答案" />
                            </horizontal>
                            <horizontal padding="10">
                                <text padding="10 0 0 0" text="2：" />
                                <text text="请确认无障碍服务已打开" />
                            </horizontal>
                            <horizontal padding="10">
                                <text padding="10 0 0 0" text="3：" />
                                <text text="若提示“接口拥堵”说明当前访问人数过多，请多试几次。如果重复五次以上无答案，请自行斟酌。" />
                            </horizontal>
                            <horizontal padding="10">
                                <text padding="10 0 0 0" text="4：" />
                                <text text="请将此软件加入白名单，否则可能在使用中途被关闭" />
                            </horizontal>
                            <horizontal padding="10">
                                <text padding="10 0 0 0" text="6：" />
                                <text text="若软件无法使用请联系作者:2587655269(QQ)" />
                            </horizontal>
                        </vertical>
                    </card>
                    <button margin="50" id="click_me" text="开始运行" tag="ScriptTag" color="#ffffff" bg="#FF4FB3FF" foreground="?selectableItemBackground" />
                </vertical>
            </frame>
        </vertical>
    </drawer>
);
ui.click_me.on('click', () => {
    beganToRun();
})