import { siteConfig } from "@/site.config";
import { getItems } from "@/lib/data";
import { ClawMachine } from "@/components/sections/claw-machine";

/* 04 결과 섹션 안의 성과 뽑기 기계.
   - 관리자 페이지 「성과 (트로피)」 탭(result)에 등록한 카드의 '제목'이 캡슐 글자가 됩니다.
   - 등록한 카드가 없으면 site.config.ts 의 clawGame.samples 가 보입니다.
   - 기계 안 자리가 9개라서 앞에서부터 9개까지만 보여요. */
const MAX_CAPSULES = 9;

export async function ResultTrophy() {
  const items = await getItems("result");
  const prizes = (items.length > 0 ? items.map((item) => item.title) : siteConfig.clawGame.samples).slice(
    0,
    MAX_CAPSULES,
  );

  return <ClawMachine prizes={prizes} />;
}
