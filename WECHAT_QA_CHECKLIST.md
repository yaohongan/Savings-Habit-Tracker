# WeChat Mini Program QA Checklist

Use this checklist before merging or submitting the mini program for review. The app is a local-first savings tracker, so the most important thing is that the first run, daily check-in, sharing, and backup flows work without CloudBase.

## Environment

- [ ] Open the project root in WeChat Developer Tools.
- [ ] Confirm `project.config.json` uses the expected AppID for the target mini program.
- [ ] Compile with no blocking errors in the developer console.
- [ ] Confirm the app can launch without enabling cloud development.

## First-Time User Flow

- [ ] Clear local storage in WeChat Developer Tools.
- [ ] Launch the mini program and confirm the empty state is shown.
- [ ] Tap a hot goal template and confirm it opens the create-goal popup instead of creating a blank goal immediately.
- [ ] Create the first goal and confirm the app opens the check-in popup for the new goal.
- [ ] Confirm the suggested amount is prefilled only when the flow asks for it, and the user still has to tap the final check-in button.

## Daily Check-In Flow

- [ ] Create or select an active goal.
- [ ] Tap the bottom primary button.
- [ ] Confirm it opens the check-in popup and pre-fills today's suggested amount.
- [ ] Change the amount manually with the keyboard.
- [ ] Select a mood tag.
- [ ] Add a note.
- [ ] Confirm the check-in.
- [ ] Confirm the goal saved amount, today's saved amount, streak, and history all update.

## Reminder Flow

- [ ] Leave `REMINDER_TEMPLATE_ID` empty and open the home page.
- [ ] Confirm the reminder action says that the reminder template must be configured first.
- [ ] Tap the reminder action and confirm it shows the configuration modal, not a fake success state.
- [ ] If a real subscription template ID is available, fill `REMINDER_TEMPLATE_ID` and confirm `wx.requestSubscribeMessage` is called from the reminder action.
- [ ] Reject the subscription request once and confirm the app says the reminder was not enabled.

## Recovery Flow

- [ ] Seed or restore data where `lastCheckInDate` is more than one day before today.
- [ ] Launch the mini program.
- [ ] Confirm the daily focus card shows a low-pressure recovery prompt.
- [ ] Complete a check-in and confirm the prompt disappears after the dashboard refreshes.

## Sharing Flow

- [ ] Use the native mini program share menu and confirm the share title is goal-specific when a goal exists.
- [ ] Use timeline sharing and confirm the query includes the share source.
- [ ] Generate a poster and confirm the poster uses the current goal/progress data.
- [ ] Save the poster to the album.

## Backup And Restore

- [ ] Create at least one goal and one check-in record.
- [ ] Open backup, copy the backup payload, and save it temporarily.
- [ ] Clear local storage.
- [ ] Restore from the copied payload.
- [ ] Confirm goals, check-in history, streak, notes, mood tags, and created dates are restored.

## Layout Checks

- [ ] Test on a small-screen simulator.
- [ ] Open the check-in popup and confirm the header is visible.
- [ ] Scroll inside the popup and confirm goal selection, note input, amount display, keyboard, and action buttons remain usable.
- [ ] Test on a tall-screen simulator and confirm the popup does not look cramped.

## Regression Checks

- [ ] Confirm there is no CloudBase quickstart page in the page list.
- [ ] Confirm the app does not require cloud functions to launch.
- [ ] Confirm only `miniprogram/pages/index/index` is registered in `miniprogram/app.json`.
- [ ] Confirm `miniprogram/images/share-mini-code.jpg` is available for poster QR/mini-code display.

## Command-Line Checks

Run these before merging:

```bash
node --test optimization-regression.test.mjs
node --check miniprogram/pages/index/index.js
node --check miniprogram/app.js
```
