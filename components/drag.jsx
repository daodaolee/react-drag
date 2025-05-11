import { useEffect, useRef, useCallback } from "react";
import { create } from "zustand";

// Zustand Store
export const Store = create((set) => ({
  activeItem: {
    id: "",
    mode: "",
  },
  setActiveItem: (item) => {

    set(() => ({ activeItem: item }));
  },
  upateActiveItem: (item) => {
    set((state) => ({
      activeItem: {
        ...state.activeItem,
        ...item,
      },
    }))
  },
  clearActiveItem: () => {
    
    set(() => ({ activeItem: { id: "", mode: "" } }));
  },
}));

export const Drag = () => {
  const ref = useRef(null);
  const isClickedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isLongPressRef = useRef(false);
  const longPressTimeout = useRef(null);
  const startPosition = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const { setActiveItem, clearActiveItem } = Store();
  const activeItem = Store((state) => state.activeItem);

  // 鼠标移动事件
  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current && ref.current) {
      const x = e.clientX - offset.current.x;
      const y = e.clientY - offset.current.y;
      ref.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  // 鼠标抬起事件
  const handleMouseUp = useCallback(() => {
    console.log("鼠标抬起了");

    // 清除长按定时器
    clearTimeout(longPressTimeout.current);

    if (isDraggingRef.current) {
      // 拖拽后放开逻辑
      console.log("拖拽完成，清空 activeItem");
      clearActiveItem(); // 清空 activeItem
      console.log(activeItem)
    } else {
      // 快速放开逻辑
      console.log("快速点击后松开，清空 activeItem");
      clearActiveItem(); // 清空 activeItem
      console.log(activeItem)
    }

    // 清理状态
    isDraggingRef.current = false;
    isLongPressRef.current = false;
    isClickedRef.current = false;

    // 移除事件监听
    window.removeEventListener("pointermove", handleMouseMove);
    window.removeEventListener("pointerup", handleMouseUp);
  }, [handleMouseMove, clearActiveItem]);

  // 鼠标按下事件
  const handleMouseDown = useCallback((e) => {
    console.log("鼠标点击了");
    isClickedRef.current = true;

    // 设置 activeItem 的 id
    console.log(`快速点击，设置 activeItem`);
    setActiveItem({ id:1, mode: "" }); // 只设置 id
    console.log(activeItem)

    // 记录鼠标初始位置和元素偏移
    startPosition.current = { x: e.clientX, y: e.clientY };
    const rect = ref.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // 立即绑定 pointerup 事件，确保快速点击也能触发 handleMouseUp
    window.addEventListener("pointerup", handleMouseUp);

    // 设置长按定时器
    longPressTimeout.current = setTimeout(() => {
      isDraggingRef.current = true;
      isLongPressRef.current = true;

      // 设置 activeItem 的 id 和 mode 为 "drag"
      console.log(`长按触发拖拽，设置 activeItem: `);
      setActiveItem({ id:2, mode: "drag" }); // 设置 id 和 mode
      console.log(activeItem)

      // 绑定拖拽事件
      window.addEventListener("pointermove", handleMouseMove);
    }, 500); // 500ms for long press
  }, [handleMouseUp, handleMouseMove,  setActiveItem]);

  // 注册拖拽事件
  const registerDragger = useCallback((node) => {
    if (node) {
      node.addEventListener("pointerdown", handleMouseDown);
    }
  }, [handleMouseDown]);

  // 注册和清理事件
  useEffect(() => {
    registerDragger(ref.current);
    return () => {
      if (ref.current) {
        ref.current.removeEventListener("pointerdown", handleMouseDown);
      }
    };
  }, [registerDragger, handleMouseDown]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-50 h-50 border-2 border-red-500">
        <div
          className="w-10 h-10 select-none bg-amber-300 text-[12px]"
          ref={ref}
          style={{ position: "absolute" }} // 确保元素可移动
        >
          drag me
        </div>
      </div>
    </div>
  );
};