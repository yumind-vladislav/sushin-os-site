import { SushinDesktop } from '@/components/sushin-os/sushin-desktop';
import { getBoxNewsSummaries } from '@/lib/box-news';

export default function Home() {
  return <SushinDesktop boxNewsPosts={getBoxNewsSummaries()} />;
}
