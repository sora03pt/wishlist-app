import { SessionControls } from "@/components/auth/session-controls";
import { WishlistPage } from "@/features/wishlist/components/wishlist-page";

export default function Home() {
  return (
    <>
      <SessionControls />
      <WishlistPage />
    </>
  );
}
