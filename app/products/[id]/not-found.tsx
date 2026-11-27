import NotFound from "@/app/not-found";
import DevProductFallback from "@/Components/Product/DevProductFallback";

// A product that isn't on the public (cached) page. Normal visitors get the
// site 404; a "dev" account gets test products loaded with its login.
export default function ProductNotFound() {
    return (
        <DevProductFallback>
            <NotFound />
        </DevProductFallback>
    );
}
