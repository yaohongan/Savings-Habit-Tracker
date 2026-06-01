const assert = require("assert");
const fs = require("fs");

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const wxml = fs.readFileSync("miniprogram/pages/index/index.wxml", "utf8");
const wxss = fs.readFileSync("miniprogram/pages/index/index.wxss", "utf8");

test("wxml tags are balanced", () => {
  const stack = [];
  const tagPattern = /<\/?([a-zA-Z][\w-]*)([^>]*)>/g;
  const voidTags = new Set(["input", "image"]);
  let match;

  while ((match = tagPattern.exec(wxml))) {
    const full = match[0];
    const tag = match[1];
    const rest = match[2] || "";
    const line = wxml.slice(0, match.index).split("\n").length;

    if (full.startsWith("</")) {
      const open = stack.pop();
      assert.ok(open, `unexpected end tag ${tag} at line ${line}`);
      assert.strictEqual(tag, open.tag, `expected </${open.tag}> from line ${open.line}, got </${tag}> at line ${line}`);
      continue;
    }

    if (!rest.trim().endsWith("/") && !voidTags.has(tag)) {
      stack.push({ tag, line });
    }
  }

  assert.deepStrictEqual(stack, []);
});

test("check-in popup keeps primary check-in action in a fixed footer", () => {
  assert.ok(wxml.includes('class="checkin-fixed-footer"'));
  assert.ok(wxml.includes('class="checkin-primary-confirm"'));
  assert.ok(wxss.includes(".checkin-fixed-footer"));
  assert.ok(wxss.includes("position: sticky"));
});

test("check-in popup no longer offers poster generation inside the keypad", () => {
  const checkinPopup = wxml.slice(wxml.indexOf("popup-content-checkin"), wxml.indexOf("<!-- 创建目标弹窗 -->"));
  assert.ok(!checkinPopup.includes("action-btn-share"));
  assert.ok(!checkinPopup.includes("海报"));
});

test("check-in note area is collapsed by default", () => {
  const checkinPopup = wxml.slice(wxml.indexOf("popup-content-checkin"), wxml.indexOf("<!-- 创建目标弹窗 -->"));

  assert.ok(checkinPopup.includes("showCheckInNote"));
  assert.ok(checkinPopup.includes('bindtap="onToggleCheckInNote"'));
  assert.ok(checkinPopup.includes('wx:if="{{showCheckInNote}}"'));
});

test("share center has one poster generation action with explicit current template wording", () => {
  const growthCard = wxml.slice(wxml.indexOf("xhs-growth-card"), wxml.indexOf("review-entry-card"));
  const generateCount = (growthCard.match(/生成/g) || []).length;
  assert.strictEqual(generateCount, 1);
  assert.ok(growthCard.includes("生成当前模板"));
});

test("home keeps poster generation to prompt plus material center only", () => {
  const posterActions = wxml.match(/bindtap="onGeneratePoster"/g) || [];

  assert.strictEqual(posterActions.length, 2);
  assert.ok(wxml.includes('bindtap="onOpenXhsCenter"'));
});
