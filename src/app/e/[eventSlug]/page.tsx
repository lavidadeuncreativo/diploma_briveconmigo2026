import { Suspense } from "react";
import GeneratorClient from "./GeneratorClient";

interface Props {
    params: Promise<{ eventSlug: string }>;
}

export default async function EventPage({ params }: Props) {
    const { eventSlug } = await params;

    return (
        <Suspense
            fallback={
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div style={{ textAlign: "center", color: "rgba(11,18,32,0.45)", fontFamily: "'Inter', sans-serif" }}>
                        Cargando…
                    </div>
                </div>
            }
        >
            <GeneratorClient eventSlug={eventSlug} />
        </Suspense>
    );
}
