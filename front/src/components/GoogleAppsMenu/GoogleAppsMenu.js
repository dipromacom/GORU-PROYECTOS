import { useState, useRef, useEffect } from "react";
import "./GoogleAppsMenu.css";

const apps = [
    {
        name: "Gmail",
        icon: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
        url: "https://mail.google.com/",
    },
    {
        name: "Drive",
        icon: "https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
        url: "https://drive.google.com/",
    },
    {
        name: "Calendar",
        icon: "https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png",
        url: "https://calendar.google.com/",
    },
    {
        name: "Docs",
        icon: "https://www.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png",
        url: "https://docs.google.com/",
    },
    {
        name: "Sheets",
        icon: "https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
        url: "https://sheets.google.com/",
    },
    {
        name: "Slides",
        icon: "https://www.gstatic.com/images/branding/product/1x/slides_2020q4_48dp.png",
        url: "https://slides.google.com/",
    },
    {
        name: "Meet",
        icon: "https://www.gstatic.com/images/branding/product/1x/meet_2020q4_48dp.png",
        url: "https://meet.google.com/",
    },
    {
        name: "Chat",
        icon: "https://www.gstatic.com/images/branding/product/1x/chat_2020q4_48dp.png",
        url: "https://chat.google.com/",
    }
];

export default function GoogleAppsMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="google-apps-container" ref={menuRef}>
            <button
                className="google-apps-button"
                onClick={() => setOpen(!open)}
                title="Aplicaciones de Google"
            >
                <div className="google-dots">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <span key={i} className="dot" />
                    ))}
                </div>
            </button>

            {open && (
                <div className="google-apps-menu">
                    {apps.map((app) => (
                        <a
                            key={app.name}
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="google-app-item"
                        >
                            <img src={app.icon} alt={app.name} />
                            <span>{app.name}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
