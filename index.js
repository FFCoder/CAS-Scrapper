const puppeteer = require('puppeteer');
const accounting = require('accounting');
const request = require('request');

const CAS_LOGIN = 'https://consolidatedadmin.lh1ondemand.com/Login.aspx';
const CAS_USERNAME = process.env.CAS_USERNAME;
const CAS_PASSWORD = process.env.CAS_PASSWORD;
const SLACK_HOOK = process.env.SLACK_HOOK;

if (CAS_USERNAME == '' || CAS_USERNAME == null) {
    console.error("Check Environment Variables.");
    process.exit(-1);
}

const getData = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(CAS_LOGIN);

    const loginBoxID = "ctl00_ctl00_PageContent_Body_LoginPageCustomContent_ctl00_txtUsername_ctl01";
    const passwordBoxID = "ctl00_ctl00_PageContent_Body_LoginPageCustomContent_ctl00_txtPassword_ctl02";
    const loginBtnID = "ctl00_ctl00_PageContent_Body_LoginPageCustomContent_ctl00_btnLogin_panel";

    await page.type(`#${loginBoxID}`, CAS_USERNAME, { delay: 20 });
    await page.type(`#${passwordBoxID}`, CAS_PASSWORD, { delay: 50 });

    await page.click(`#${loginBtnID}`,{delay: 20});
    
    const FSA_Amt_ID = "#ctl00_ctl00_ctl00_ctl00_PageContent_Body_Body_Body_HomePageCustomContent_ctl02_rptBalanceSections_ctl00_cntNestedSection_rptSectionItems_ctl00_cntSectionItem_lblAmount";

    await page.waitForFunction(
        `document.querySelector("body").innerText.includes("$")`
    );
    const element = await page.$(FSA_Amt_ID);
    const text = await page.evaluate(element => element.textContent, element);
    await browser.close();

    const finalAmt = accounting.unformat(text);
    return finalAmt
    

}

getData().then(amt => {
    let dollarAmt = accounting.formatMoney(amt, '$')
    request.post(SLACK_HOOK, {
        json: {
            text: `Your FSA Balance is: ${dollarAmt}`
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error);
            return;
        }
        if (res.statusCode == 200) {
            console.log("Notified");
            return;
        }
        else {
            console.log(`Status Code: ${res.statusCode}`);
            console.log(body);
            return;
        }
    })
})