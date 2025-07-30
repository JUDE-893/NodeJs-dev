
// EMMIT A HUMAN_LIKE USE BY ADDING A DELAY OF 3 ~ 8s
export async function humandelay_emmitter(page) {
  page.waitForTimeout(3000 + Math.random() * 5000)
};
