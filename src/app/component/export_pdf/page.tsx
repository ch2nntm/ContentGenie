"use client";
import React, {useRef} from "react";
import html2pdf from "html2pdf.js";

const App = () => {
    const slidesRef = useRef(null);

    const handleGeneratePdf = () => {
        const opt = {
            margin: 1,
            filename: "document.pdf",
            image: {type: "jpeg", quality: 0.98},
            html2canvas: {scale: 2, useCORS: true},
            jsPDF: {unit: "in", format: "letter", orientation: "portrait"}
        };
        html2pdf().from(slidesRef.current).set(opt).save();
    };

    return(
        <div>
            <div ref={slidesRef}>
                <div>
                    <div>
                        <h1>Hello, World!</h1>
                        <p>This is a PDF generated from HTML content using html2pdf.js</p>
                        <img width={50} src="/icon_GG.svg"/>
                        <img src="https://res.cloudinary.com/dtxm8ymr6/image/upload/v1742291269/jdk5jazcqwpsfjdhzqhz.png"/>
                    </div>
                </div>
            </div>
            <div>
                <button onClick={handleGeneratePdf}>
                    Generate PDF
                </button>
            </div>
        </div>
    );
};

export default App;