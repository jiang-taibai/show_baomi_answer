// ==UserScript==
// @name         显示中国保密在线考试答案
// @namespace    http://tampermonkey.net/
// @version      v1.0.0-2024-05-30
// @description  显示中国保密在线考试答案
// @author       CoderJiang
// @match        http://www.baomi.org.cn/bmExam?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baomi.org.cn
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function getOptionIndex(option) {
        return option.charCodeAt(0) - 'A'.charCodeAt(0);
    }

    function getAnsIndex(jsonObject) {
        const typeList = jsonObject.data.typeList;
        const answers = [];
        typeList.forEach(type => {
            type.questionList.forEach(question => {
                const ans = question.answer
                const ansIndex = getOptionIndex(ans);
                answers.push(ansIndex);
            });
        });
        return answers
    }

    function displayAnswers(answers) {
        const quesOptionsBoxes = document.querySelectorAll('.ques_options-box');
        for (let i = 0; i < answers.length; i++) {
            const quesOptionsBox = quesOptionsBoxes[i];
            const ansIndex = answers[i];
            const option = quesOptionsBox.querySelectorAll('label')[ansIndex];
            option.style.backgroundColor = 'yellow';
        }
    }

    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        if (url.includes("/portal/main-api/v2/activity/exam/getExamContentData.do")) {
            console.debug(url)
            const examId = url.split('examId=')[1].split('&')[0];
            const randomId = url.split('randomId=')[1];
            const apiUrl = `http://www.baomi.org.cn/portal/main-api/v2/activity/exam/getExamContentData.do?examId=${examId}&randomId=${randomId}`;
            GM_xmlhttpRequest({
                method: "GET",
                url: apiUrl,
                onload: function (response) {
                    if (response.status >= 200 && response.status < 300) {
                        const answers = getAnsIndex(JSON.parse(response.responseText));
                        displayAnswers(answers);
                    } else {
                        console.debug('API Request Failed:', response.statusText);
                    }
                }
            });
        }
        originalOpen.apply(this, arguments)
    }
})();