"use client";
import { Button, FilledInput } from "@mui/material";
import { useState } from "react";

export default function DownloadImageClient() {
    const [imagePath, setImagePath] = useState(null);

    async function handleDownload() {
        const imageUrl = "https://png.pngtree.com/png-vector/20220228/ourmid/pngtree-blue-background-transparent-with-curve-wave-abstract-png-image_4469086.png"; // URL ảnh cần tải

        const response = await fetch("/api/mastodon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
        });

        const data = await response.json();
        if (data.success) {
            setImagePath(data.path);
        } else {
            console.error("Lỗi tải ảnh:", data.error);
        }
    }

    return (
        <div>
            <Button className = "">Hello</Button>
            <FilledInput></FilledInput>
        </div>
    );
}
