import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, selectors } from "../../reducers/whiteboard";
import { useParams } from "react-router-dom";
import "./Whiteboard.css";

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null); // canvas-wrapper DOM node (for postits/images)
    const containerRef = useRef(null); // canvas-container DOM node
    const ctxRef = useRef(null);
    const savedImageRef = useRef(null); // to store imageData when drawing shapes
    const dprRef = useRef(window.devicePixelRatio || 1);

    // tools & state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState("pen"); // 'pen' | 'eraser' | 'shape' | 'postit' | 'image'
    const [drawMode, setDrawMode] = useState("free"); // 'free' | 'rect' | 'circle' | 'triangle' | 'eraser'
    const [brushColor, setBrushColor] = useState("#1f2937");
    const [brushSize, setBrushSize] = useState(3);
    const [postitColor, setPostitColor] = useState("yellow");

    // drawing coords
    const startRef = useRef({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const panRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(1);
    const lastPanPointRef = useRef({ x: 0, y: 0 });

    // counters for ids
    const postitCounterRef = useRef(0);
    const imageCounterRef = useRef(0);

    // === Redux setup ===
    const dispatch = useDispatch();
    const { id: projectId } = useParams(); // o props.projectId si lo pasas como prop
    const whiteboard = useSelector(selectors.getWhiteboard);
    const content = useSelector(selectors.getContent);

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!wrapperRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 } // se considera visible si al menos 10% del elemento se ve
        );

        observer.observe(wrapperRef.current);

        return () => observer.disconnect();
    }, []);

    // === Limpiar y cargar la pizarra del proyecto actual ===
    useEffect(() => {
        if (!projectId || !isVisible) return;

        // Limpieza completa inmediata (canvas + Redux + local)
        clearCanvas();
        const wrapper = wrapperRef.current;
        if (wrapper) {
            wrapper.querySelectorAll(".postit, .uploaded-image").forEach((el) => el.remove());
        }
        localStorage.removeItem(`whiteboard_${projectId}`);
        dispatch(actions.clean());

        // 🔹 Pequeño delay para asegurar que se renderice el canvas vacío
        const timeout = setTimeout(() => {
            dispatch(actions.fetch({ projectId }));
        }, 200);

        return () => clearTimeout(timeout);
    }, [projectId, dispatch, , isVisible]);



    // === sincronización periódica con el servidor ===
    useEffect(() => {
        if (!projectId || !isVisible) return;
        const interval = setInterval(() => {
            dispatch(actions.sync({ projectId }));
        }, 30000); // cada 30s
        return () => clearInterval(interval);
    }, [projectId, dispatch, isVisible]);


    // initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = dprRef.current;

        // ⚙️ función para redimensionar sin borrar el contenido
        const resizeCanvasSafely = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;

            // Guardar contenido actual antes de cambiar tamaño
            const ctx = ctxRef.current || canvas.getContext("2d");
            const oldData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Redimensionar canvas sin perder DPI
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;

            const newCtx = canvas.getContext("2d");
            newCtx.scale(dpr, dpr);
            newCtx.lineCap = "round";
            newCtx.lineJoin = "round";
            newCtx.strokeStyle = brushColor;
            newCtx.lineWidth = brushSize;

            // Restaurar imagen (ajustando tamaño si es necesario)
            try {
                newCtx.putImageData(oldData, 0, 0);
            } catch {
                /* Si el tamaño cambia mucho, ignoramos error */
            }

            ctxRef.current = newCtx;
        };

        // Esperar al siguiente frame para asegurar que el contenedor está renderizado
        requestAnimationFrame(resizeCanvasSafely);

        // 🧩 usar ResizeObserver para detectar cambios reales en el contenedor
        const observer = new ResizeObserver(() => resizeCanvasSafely());
        observer.observe(container);

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // update brush style when brush changes
    useEffect(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = 1;
    }, [brushColor, brushSize]);

    // --- Helpers ---
    const getCanvasPoint = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomRef.current - panRef.current.x;
        const y = (e.clientY - rect.top) / zoomRef.current - panRef.current.y;
        return { x, y };
    };

    const screenToCanvas = (screenX, screenY) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (screenX - rect.left) / zoomRef.current - panRef.current.x,
            y: (screenY - rect.top) / zoomRef.current - panRef.current.y,
        };
    };

    // Save imageData before previewing shapes
    const saveCanvasSnapshot = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        try {
            const dpr = dprRef.current;
            // get image data in device pixels
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            savedImageRef.current = imageData;
        } catch (err) {
            // Security/cross-origin could block; ignore preview if problematic
            savedImageRef.current = null;
        }
    };

    const restoreCanvasSnapshot = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx || !savedImageRef.current) return;
        try {
            ctx.putImageData(savedImageRef.current, 0, 0);
        } catch (err) {
            // ignore
        }
    };

    // drawing handlers
    const handlePointerDown = (e) => {
        // left button only
        if (e.button !== 0) return;
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        // if postit mode, create postit instead of drawing
        if (currentTool === "postit") {
            const rect = canvasEl.getBoundingClientRect();
            // coordinates relative to wrapper
            const x = e.clientX - rect.left + panRef.current.x * zoomRef.current;
            const y = e.clientY - rect.top + panRef.current.y * zoomRef.current;
            createPostitAt(x / zoomRef.current, y / zoomRef.current);
            return;
        }

        if (currentTool === "image") {
            // trigger image input
            const input = document.getElementById("imageInput");
            if (input) input.click();
            return;
        }

        if (currentTool !== "pen" && currentTool !== "eraser" && currentTool !== "shape") {
            // other tools not handled here
            setIsDrawing(false);
            return;
        }

        // drawing / shapes
        const point = getCanvasPoint(e);
        startRef.current = { x: point.x, y: point.y };
        const ctx = ctxRef.current;
        if (!ctx) return;

        if (drawMode === "free" || drawMode === "eraser") {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            setIsDrawing(true);
            setupBrushForDraw();
        } else {
            // shapes: save snapshot for preview and draw temp
            saveCanvasSnapshot();
            setIsDrawing(true);
            setupBrushForDraw();
        }

        e.preventDefault();
    };

    const handlePointerMove = (e) => {
        if (!isDrawing) return;
        const ctx = ctxRef.current;
        if (!ctx) return;

        const point = getCanvasPoint(e);

        if (drawMode === "free" || drawMode === "eraser") {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        } else {
            // shape preview
            restoreCanvasSnapshot();
            drawShapePreview(startRef.current.x, startRef.current.y, point.x, point.y);
        }
    };

    const handlePointerUp = (e) => {
        if (!isDrawing) return;
        const ctx = ctxRef.current;
        if (!ctx) return;
        const point = getCanvasPoint(e);

        if (drawMode === "free" || drawMode === "eraser") {
            ctx.closePath();
        } else {
            // finalize shape onto canvas
            restoreCanvasSnapshot();
            drawShapePreview(startRef.current.x, startRef.current.y, point.x, point.y, true);
        }

        setIsDrawing(false);
        savedImageRef.current = null;
    };

    // set brush properties depending on type and eraser
    const setupBrushForDraw = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        if (drawMode === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = Math.max(brushSize * 2, 8);
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.globalAlpha = 1;
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = brushSize;
            ctx.strokeStyle = brushColor;
        }
    };

    const drawShapePreview = (sx, sy, ex, ey, finalize = false) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.beginPath();
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushColor;
        ctx.globalCompositeOperation = "source-over";
        switch (drawMode) {
            case "rect":
                ctx.strokeRect(sx, sy, ex - sx, ey - sy);
                break;
            case "circle": {
                const radius = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
                ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case "triangle": {
                const centerX = (sx + ex) / 2;
                ctx.moveTo(centerX, sy);
                ctx.lineTo(sx, ey);
                ctx.lineTo(ex, ey);
                ctx.closePath();
                ctx.stroke();
                break;
            }
            default:
                break;
        }
        if (finalize) ctx.closePath();
    };

    // clear canvas & remove postits/images
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        // clear full pixel area (device pixels)
        const dpr = dprRef.current;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform (safe)
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        // reapply scale if needed
        ctx.scale(dpr, dpr);

        // remove postits and uploaded images
        const wrapper = wrapperRef.current;
        if (wrapper) {
            wrapper.querySelectorAll(".postit, .uploaded-image").forEach((el) => el.remove());
        }

        // small feedback
        showClearFeedback();
    };

    // feedback on clear
    const showClearFeedback = () => {
        const feedback = document.createElement("div");
        feedback.className = "wb-clear-feedback";
        feedback.textContent = "🧹 ¡Pizarra limpiada!";
        document.body.appendChild(feedback);
        setTimeout(() => {
            if (feedback.parentNode) feedback.remove();
        }, 1600);
    };

    // shapes/toolbar helpers
    const handleSetDrawMode = (mode) => {
        setDrawMode(mode);
        if (mode === "eraser") {
            setCurrentTool("eraser");
        } else {
            setCurrentTool("pen");
        }
        // highlight handled in JSX via active class
    };

    // POST-ITS
    const createPostitAt = (x, y, colorClass = "yellow", text = "", id = null) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const note = document.createElement("div");
        note.className = `postit ${colorClass}`;
        note.style.left = `${Math.max(10, x)}px`;
        note.style.top = `${Math.max(10, y)}px`;

        // ✅ Mantener ID existente si se está restaurando
        note.id = id || `postit-${++postitCounterRef.current}`;

        const textarea = document.createElement("textarea");
        textarea.placeholder = "Escribe tu nota aquí...";
        textarea.value = text || ""; // ✅ restaurar texto

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "×";
        deleteBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            note.remove();
        });

        note.appendChild(textarea);
        note.appendChild(deleteBtn);
        wrapper.appendChild(note);
        enableDragForElement(note);

        // Foco solo si es nuevo
        if (!id) setTimeout(() => textarea.focus(), 80);
    };

    // Postit create via floating menu 'create' button
    useEffect(() => {
        const createBtn = document.getElementById("createPostit");
        if (!createBtn) return;
        const handler = () => createPostitAt(60 + Math.random() * 200, 60 + Math.random() * 120, postitColor);
        createBtn.addEventListener("click", handler);
        return () => createBtn.removeEventListener("click", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postitColor]);

    // enable drag on elements (postits & images)
    const enableDragForElement = (el) => {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let origLeft = 0;
        let origTop = 0;

        const onDown = (ev) => {
            if (ev.target.tagName === "TEXTAREA" || ev.target.classList.contains("delete-btn")) {
                return;
            }
            dragging = true;
            startX = ev.clientX;
            startY = ev.clientY;
            origLeft = parseFloat(el.style.left || 0);
            origTop = parseFloat(el.style.top || 0);
            el.style.zIndex = 9999;
            ev.preventDefault();
        };

        const onMove = (ev) => {
            if (!dragging) return;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            el.style.left = origLeft + dx + "px";
            el.style.top = origTop + dy + "px";
        };

        const onUp = () => {
            dragging = false;
            el.style.zIndex = "auto";
        };

        el.addEventListener("mousedown", onDown);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);

        // cleanup: if element removed, remove listeners (not strictly necessary here but safer)
        const observer = new MutationObserver(() => {
            if (!document.body.contains(el)) {
                el.removeEventListener("mousedown", onDown);
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    // IMAGE upload & add
    useEffect(() => {
        const input = document.getElementById("imageInput");
        if (!input) return;
        const handler = (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const wrapper = wrapperRef.current;
                if (!wrapper) return;
                const img = document.createElement("img");
                img.src = ev.target.result;
                img.className = "uploaded-image";
                img.style.left = `${50 + Math.random() * 150}px`;
                img.style.top = `${50 + Math.random() * 100}px`;
                img.id = `image-${++imageCounterRef.current}`;

                const del = document.createElement("button");
                del.className = "delete-btn";
                del.textContent = "×";
                del.addEventListener("click", (ev2) => {
                    ev2.stopPropagation();
                    img.remove();
                });

                img.appendChild(del);
                wrapper.appendChild(img);
                enableDragForElement(img);
            };
            reader.readAsDataURL(file);
            // reset input
            e.target.value = "";
        };

        input.addEventListener("change", handler);
        return () => input.removeEventListener("change", handler);
    }, []);

    // make color palette clickable (uses data-color)
    useEffect(() => {
        const colorBtns = document.querySelectorAll(".color-palette .color-btn[data-color]");
        colorBtns.forEach((btn) => {
            btn.addEventListener("click", (ev) => {
                const c = ev.currentTarget.dataset.color;
                setBrushColor(c);
                // update active class:
                colorBtns.forEach((b) => b.classList.remove("active"));
                ev.currentTarget.classList.add("active");
                // if eraser active, switch to pen
                if (drawMode === "eraser") {
                    setDrawMode("free");
                }
            });
        });
        return () => {
            colorBtns.forEach((btn) => btn.removeEventListener("click", () => { }));
        };
    }, [drawMode]);

    // brush size control
    useEffect(() => {
        const sizeInput = document.getElementById("brushSize");
        const sizeDisplay = document.getElementById("sizeDisplay");
        if (!sizeInput) return;
        const handler = (e) => {
            const val = parseInt(e.target.value, 10);
            setBrushSize(val);
            if (sizeDisplay) sizeDisplay.textContent = `${val}px`;
        };
        sizeInput.addEventListener("input", handler);
        return () => sizeInput.removeEventListener("input", handler);
    }, []);

    // draw button toggles and shape buttons
    useEffect(() => {
        // drawBtn, drawTools visibility handled in JSX via classes, but keep a couple of listeners for legacy if needed
        const freeBtn = document.getElementById("freeDrawBtn");
        const rectBtn = document.getElementById("rectBtn");
        const circleBtn = document.getElementById("circleBtn");
        const triBtn = document.getElementById("triangleBtn");
        const eraserBtn = document.getElementById("eraserBtn");

        if (freeBtn) freeBtn.addEventListener("click", () => handleSetDrawMode("free"));
        if (rectBtn) rectBtn.addEventListener("click", () => handleSetDrawMode("rect"));
        if (circleBtn) circleBtn.addEventListener("click", () => handleSetDrawMode("circle"));
        if (triBtn) triBtn.addEventListener("click", () => handleSetDrawMode("triangle"));
        if (eraserBtn) eraserBtn.addEventListener("click", () => handleSetDrawMode("eraser"));

        return () => {
            if (freeBtn) freeBtn.removeEventListener("click", () => { });
            if (rectBtn) rectBtn.removeEventListener("click", () => { });
            if (circleBtn) circleBtn.removeEventListener("click", () => { });
            if (triBtn) triBtn.removeEventListener("click", () => { });
            if (eraserBtn) eraserBtn.removeEventListener("click", () => { });
        };
    }, []);

    // zoom controls
    useEffect(() => {
        const zin = document.getElementById("zoomIn");
        const zout = document.getElementById("zoomOut");
        const zreset = document.getElementById("zoomReset");
        const updateZoomDisplay = () => {
            const el = document.getElementById("zoomLevel");
            if (el) el.textContent = `${Math.round(zoomRef.current * 100)}%`;
        };

        const doZoom = (factor) => {
            zoomRef.current = Math.max(0.5, Math.min(3, zoomRef.current * factor));
            const wrapper = wrapperRef.current;
            if (wrapper) wrapper.style.transform = `scale(${zoomRef.current}) translate(${panRef.current.x}px, ${panRef.current.y}px)`;
            updateZoomDisplay();
        };

        if (zin) zin.addEventListener("click", () => doZoom(1.2));
        if (zout) zout.addEventListener("click", () => doZoom(1 / 1.2));
        if (zreset) zin && zreset.addEventListener("click", () => {
            zoomRef.current = 1;
            panRef.current = { x: 0, y: 0 };
            const wrapper = wrapperRef.current;
            if (wrapper) wrapper.style.transform = `scale(1) translate(0px, 0px)`;
            updateZoomDisplay();
        });

        // wheel zoom (ctrl + wheel)
        const onWheel = (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            e.preventDefault();
            const delta = e.deltaY < 0 ? 1.08 : 1 / 1.08;
            doZoom(delta);
        };
        const container = containerRef.current;
        if (container) container.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            if (zin) zin.removeEventListener("click", () => { });
            if (zout) zout.removeEventListener("click", () => { });
            if (zreset) zreset.removeEventListener("click", () => { });
            if (container) container.removeEventListener("wheel", onWheel);
        };
    }, []);

    // pan (Ctrl + drag)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const onDown = (e) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            isPanningRef.current = true;
            lastPanPointRef.current = { x: e.clientX, y: e.clientY };
            container.classList.add("dragging");
            e.preventDefault();
        };
        const onMove = (e) => {
            if (!isPanningRef.current) return;
            const dx = (e.clientX - lastPanPointRef.current.x) / zoomRef.current;
            const dy = (e.clientY - lastPanPointRef.current.y) / zoomRef.current;
            panRef.current.x += dx;
            panRef.current.y += dy;
            lastPanPointRef.current = { x: e.clientX, y: e.clientY };
            const wrapper = wrapperRef.current;
            if (wrapper) wrapper.style.transform = `scale(${zoomRef.current}) translate(${panRef.current.x}px, ${panRef.current.y}px)`;
        };
        const onUp = () => {
            isPanningRef.current = false;
            container.classList.remove("dragging");
        };

        container.addEventListener("mousedown", onDown);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);

        return () => {
            container.removeEventListener("mousedown", onDown);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
    }, []);

    // keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case "d":
                        e.preventDefault();
                        setCurrentTool("pen");
                        setDrawMode("free");
                        break;
                    case "p":
                        e.preventDefault();
                        setCurrentTool("postit");
                        break;
                    case "i":
                        e.preventDefault();
                        setCurrentTool("image");
                        document.getElementById("imageInput")?.click();
                        break;
                    case "+":
                    case "=":
                        e.preventDefault();
                        document.getElementById("zoomIn")?.click();
                        break;
                    case "-":
                        e.preventDefault();
                        document.getElementById("zoomOut")?.click();
                        break;
                    case "0":
                        e.preventDefault();
                        document.getElementById("zoomReset")?.click();
                        break;
                    default:
                        break;
                }
            }
            if (currentTool === "pen" || currentTool === "eraser") {
                switch (e.key) {
                    case "1":
                        setDrawMode("free");
                        break;
                    case "2":
                        setDrawMode("rect");
                        break;
                    case "3":
                        setDrawMode("circle");
                        break;
                    case "4":
                        setDrawMode("triangle");
                        break;
                    case "5":
                        setDrawMode("eraser");
                        break;
                    default:
                        break;
                }
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTool]);

    // attach pointer listeners to canvas wrapper (so shapes and postits interact well)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // prefer pointer events (better for touch) but we used mouse events logic above; here we use mouse
        canvas.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("mousemove", handlePointerMove);
        document.addEventListener("mouseup", handlePointerUp);
        // also support touch
        canvas.addEventListener("touchstart", (ev) => {
            const touch = ev.touches[0];
            if (touch) handlePointerDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        });
        canvas.addEventListener("touchmove", (ev) => {
            ev.preventDefault();
            const touch = ev.touches[0];
            if (touch) handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });
        canvas.addEventListener("touchend", (ev) => handlePointerUp({ clientX: 0, clientY: 0 }));

        return () => {
            canvas.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("mousemove", handlePointerMove);
            document.removeEventListener("mouseup", handlePointerUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDrawing, drawMode, currentTool, brushColor, brushSize]);

    // === Auto-guardado local ===
    useEffect(() => {
        if (!isVisible) return;
        const saveLocal = () => {
            try {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const imageData = canvas.toDataURL("image/png");
                const wrapper = wrapperRef.current;
                const postits = [];
                const images = [];

                if (wrapper) {
                    wrapper.querySelectorAll(".postit").forEach((el) => {
                        postits.push({
                            id: el.id,
                            x: parseFloat(el.style.left),
                            y: parseFloat(el.style.top),
                            text: el.querySelector("textarea")?.value || "",
                            color: Array.from(el.classList).find((c) =>
                                ["yellow", "green", "blue", "pink", "purple"].includes(c)
                            ),
                        });
                    });
                    wrapper.querySelectorAll(".uploaded-image").forEach((el) => {
                        images.push({
                            id: el.id,
                            x: parseFloat(el.style.left),
                            y: parseFloat(el.style.top),
                            src: el.src,
                        });
                    });
                }

                const localData = {
                    canvas: { image: imageData },
                    postits,
                    images,
                    zoom: zoomRef.current,
                    pan: panRef.current,
                };

                localStorage.setItem(`whiteboard_${projectId}`, JSON.stringify(localData));
                dispatch(actions.updateContent({ content: localData }));
            } catch (err) {
                console.error("Error guardando pizarra local:", err);
            }
        };

        // guardar cada 10 segundo
        const interval = setInterval(saveLocal, 10000);
        return () => clearInterval(interval);
    }, [projectId, dispatch, isVisible]);

    const loadWhiteboardContent = (data) => {
        try {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            const wrapper = wrapperRef.current;
            if (!canvas || !ctx || !wrapper) return;

            // limpiar todo antes de restaurar
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            wrapper.querySelectorAll(".postit, .uploaded-image").forEach((el) => el.remove());

            // restaurar imagen
            if (data.canvas?.image) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = data.canvas.image;
            }

            // restaurar post-its
            if (Array.isArray(data.postits)) {
                data.postits.forEach((p) => {
                    createPostitAt(p.x, p.y, p.color, p.text, p.id);
                });
            }

            // restaurar imágenes
            if (Array.isArray(data.images)) {
                data.images.forEach((imgData) => {
                    const img = document.createElement("img");
                    img.src = imgData.src;
                    img.className = "uploaded-image";
                    img.style.left = `${imgData.x}px`;
                    img.style.top = `${imgData.y}px`;
                    img.id = imgData.id;
                    const del = document.createElement("button");
                    del.className = "delete-btn";
                    del.textContent = "×";
                    del.addEventListener("click", (ev) => {
                        ev.stopPropagation();
                        img.remove();
                    });
                    img.appendChild(del);
                    wrapper.appendChild(img);
                    enableDragForElement(img);
                });
            }

            // restaurar zoom y pan
            if (data.zoom) zoomRef.current = data.zoom;
            if (data.pan) panRef.current = data.pan;

            wrapper.style.transform = `scale(${zoomRef.current}) translate(${panRef.current.x}px, ${panRef.current.y}px)`;
        } catch (err) {
            console.error("Error restaurando pizarra:", err);
        }
    };

    const loading = useSelector((state) => state.whiteboard.loading);
    useEffect(() => {
        if (loading) return; 
        // Esperar a que el canvas esté listo antes de cargar contenido
        const tryLoad = () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) {
                // Intentar nuevamente en el siguiente frame
                requestAnimationFrame(tryLoad);
                return;
            }

            // Canvas listo: restaurar contenido del servidor o localStorage
            if (whiteboard?.content) {
                loadWhiteboardContent(whiteboard.content);
            } else {
                const saved = localStorage.getItem(`whiteboard_${projectId}`);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        loadWhiteboardContent(parsed);
                    } catch (err) {
                        console.error("Error cargando pizarra local:", err);
                    }
                }
            }
        };

        tryLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteboard, loading]);

    // render UI
    return (
        <div className="whiteboard-container">
            <header className="whiteboard-header">
                <h1>🎨 Pizarra Goru</h1>
                <div className="toolbar">
                    <div className="tool-section">
                        <button
                            id="drawBtn"
                            className={`tool-btn ${currentTool === "pen" || currentTool === "eraser" ? "active" : ""}`}
                            onClick={() => {
                                setCurrentTool("pen");
                                setDrawMode("free");
                            }}
                        >
                            ✏️ Dibujar
                        </button>

                        <div className={`draw-tools ${currentTool === "pen" ? "active" : ""}`} id="drawTools">
                            
                            <button id="freeDrawBtn" className={`shape-btn ${drawMode === "free" ? "active" : ""}`} title="Dibujo libre" onClick={() => handleSetDrawMode("free")}>✏️</button>
                            <button id="rectBtn" className={`shape-btn ${drawMode === "rect" ? "active" : ""}`} title="Rectángulo" onClick={() => handleSetDrawMode("rect")}>▢</button>
                            <button id="circleBtn" className={`shape-btn ${drawMode === "circle" ? "active" : ""}`} title="Círculo" onClick={() => handleSetDrawMode("circle")}>⭕</button>
                            <button id="triangleBtn" className={`shape-btn ${drawMode === "triangle" ? "active" : ""}`} title="Triángulo" onClick={() => handleSetDrawMode("triangle")}>▲</button>
                            <button id="eraserBtn" className={`shape-btn ${drawMode === "eraser" ? "active" : ""}`} title="Borrador" onClick={() => handleSetDrawMode("eraser")}>🧹</button>
                        </div>
                    </div>

                    <div className="tool-section">
                        <button
                            id="postitBtn"
                            className={`tool-btn ${currentTool === "postit" ? "active" : ""}`}
                            onClick={() => setCurrentTool((prev) => (prev === "postit" ? "pen" : "postit"))}
                        >
                            📝 Post-it
                        </button>

                        <button
                            id="imageBtn"
                            className={`tool-btn ${currentTool === "image" ? "active" : ""}`}
                            onClick={() => {
                                setCurrentTool("image");
                                const input = document.getElementById("imageInput");
                                if (input) input.click();
                            }}
                        >
                            🖼️ Imagen
                        </button>

                        <button id="clearBtn" className="tool-btn" onClick={() => clearCanvas()}>🗑️ Limpiar</button>
                        <button
                            className="tool-btn"
                            onClick={() => {
                                // Forzar actualización del contenido actual
                                try {
                                    const canvas = canvasRef.current;
                                    const imageData = canvas.toDataURL("image/png");
                                    const wrapper = wrapperRef.current;
                                    const postits = [];
                                    const images = [];

                                    if (wrapper) {
                                        wrapper.querySelectorAll(".postit").forEach((el) => {
                                            postits.push({
                                                id: el.id,
                                                x: parseFloat(el.style.left),
                                                y: parseFloat(el.style.top),
                                                text: el.querySelector("textarea")?.value || "",
                                                color: Array.from(el.classList).find((c) =>
                                                    ["yellow", "green", "blue", "pink", "purple"].includes(c)
                                                ),
                                            });
                                        });
                                        wrapper.querySelectorAll(".uploaded-image").forEach((el) => {
                                            images.push({
                                                id: el.id,
                                                x: parseFloat(el.style.left),
                                                y: parseFloat(el.style.top),
                                                src: el.src,
                                            });
                                        });
                                    }

                                    const localData = {
                                        canvas: { image: imageData },
                                        postits,
                                        images,
                                        zoom: zoomRef.current,
                                        pan: panRef.current,
                                    };
                                    console.log(localData)
                                    dispatch(actions.updateContent({ content: localData }));
                                    dispatch(actions.sync({ projectId }));

                                } catch (err) {
                                    console.error("Error forzando guardado manual:", err);
                                }
                            }}
                        >
                            💾 Guardar
                        </button>
                    </div>

                    <div className="color-palette">
                        {["#1f2937", "#dc2626", "#059669", "#2563eb", "#7c3aed", "#d97706", "#be185d"].map((c) => (
                            <div
                                key={c}
                                className={`color-btn ${brushColor === c ? "active" : ""}`}
                                style={{ background: c }}
                                data-color={c}
                                onClick={() => {
                                    setBrushColor(c);
                                    // remove eraser
                                    if (drawMode === "eraser") setDrawMode("free");
                                    // update visual active handled by class
                                }}
                            />
                        ))}
                    </div>

                    <div className="brush-size">
                        <label>Grosor:</label>
                        <input id="brushSize" type="range" min="1" max="50" defaultValue={brushSize} />
                        <span id="sizeDisplay">{brushSize}px</span>
                    </div>
                </div>
            </header>

            <div className="canvas-container" ref={containerRef}>
                <div className="canvas-wrapper" id="canvasWrapper" ref={wrapperRef}>
                    <canvas id="whiteboard" ref={canvasRef} />
                </div>
                <input id="imageInput" className="file-input" type="file" accept="image/*" />
            </div>

            <div className="zoom-controls">
                <button className="zoom-btn" id="zoomIn" title="Acercar (Ctrl + +)">+</button>
                <div className="zoom-level" id="zoomLevel">100%</div>
                <button className="zoom-btn" id="zoomOut" title="Alejar (Ctrl + -)">-</button>
                <button className="zoom-btn" id="zoomReset" title="Restablecer zoom (Ctrl + 0)">⌂</button>
            </div>

            <div className={`floating-menu ${currentTool === "postit" ? "active" : ""}`} id="postitMenu">
                <h3>Crear Post-it</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
                    <button
                        className={`color-btn ${postitColor === "yellow" ? "active" : ""}`}
                        style={{ background: "#fef08a", borderColor: "rgba(217, 119, 6, 0.3)" }}
                        data-postit-color="yellow"
                        onClick={() => setPostitColor("yellow")}
                    />
                    <button
                        className={`color-btn ${postitColor === "green" ? "active" : ""}`}
                        style={{ background: "#bbf7d0", borderColor: "rgba(34, 197, 94, 0.3)" }}
                        data-postit-color="green"
                        onClick={() => setPostitColor("green")}
                    />
                    <button
                        className={`color-btn ${postitColor === "blue" ? "active" : ""}`}
                        style={{ background: "#bfdbfe", borderColor: "rgba(59, 130, 246, 0.3)" }}
                        data-postit-color="blue"
                        onClick={() => setPostitColor("blue")}
                    />
                    <button
                        className={`color-btn ${postitColor === "pink" ? "active" : ""}`}
                        style={{ background: "#fce7f3", borderColor: "rgba(236, 72, 153, 0.3)" }}
                        data-postit-color="pink"
                        onClick={() => setPostitColor("pink")}
                    />
                    <button
                        className={`color-btn ${postitColor === "purple" ? "active" : ""}`}
                        style={{ background: "#e9d5ff", borderColor: "rgba(147, 51, 234, 0.3)" }}
                        data-postit-color="purple"
                        onClick={() => setPostitColor("purple")}
                    />
                </div>
                <button id="createPostit">Crear Post-it</button>
            </div>
        </div>
    );
};

export default Whiteboard;
