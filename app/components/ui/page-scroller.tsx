import React, {
  Children,
  createElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEventHandler,
} from "react";

interface PageScrollerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  onIndexChange?: (currentIndex: number, totalSections: number) => void;
  useNativeScroll?: boolean;
}

let wheelTime: number = -1;
const wheelThrottle = 500;

export function PageScroller({ children, scrollable = true, onIndexChange, useNativeScroll = true }: PageScrollerProps) {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const pageContainer = useRef<HTMLDivElement>(null);
  const pageCount = Children.count(children);
  const [scrollableUp, setScrollableUp] = useState<boolean>(false);
  const [scrollableDown, setScrollableDown] = useState<boolean>(true);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [previousTouchMove, setPreviousTouchMove] = useState<number | null>(
    null
  );
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  const [startTouch, setStartTouch] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  const refs = useRef<Array<HTMLElement>>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Notify parent component when index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex, pageCount);
    }
  }, [currentIndex, pageCount, onIndexChange]);
  
  useEffect(() => {
    const currentPageRef = refs.current[currentIndex];
    const currentPageScrollTop = currentPageRef.scrollTop;
    
    console.log(`Action: ${currentIndex}`, `scrollableUp: ${scrollableUp}`, `scrollableDown: ${scrollableDown}`, `currentPageScrollTop: ${currentPageScrollTop}`)
  }, [scrollableDown, scrollableUp, currentIndex])
  
  useEffect(() => {
    if (!refs.current.length) return;
    
    const pageContainerDom = refs.current[currentIndex];
    
    const headerDom = document.getElementById("header");
    
    if (!headerDom) {
      return
    }

    determineIfHeaderBlurred()
    
    function determineIfHeaderBlurred() {
      if (pageContainerDom.scrollTop > 0) {
        headerDom?.classList.add('opacity-50');
      } else {
        headerDom?.classList.remove('opacity-50');
      }
    }

    pageContainerDom.addEventListener('scroll', determineIfHeaderBlurred);

    return () => {
      pageContainerDom.removeEventListener('scroll', determineIfHeaderBlurred);
    };
  }, [refs, currentIndex])

  const scrollPage = useCallback((currentIndex: number, direction: string) => {
    if (!pageContainer.current) return;

    if (!scrollable) {
      return;
    }

    const currentPageRef = refs.current[currentIndex];
    const previousPageRef = refs.current[currentIndex - 1] ?? null;

    if (previousPageRef && previousPageRef.classList.contains('page-scroller-disabled')) {
      return;
    }

    if (direction === 'up' && !scrollableUp) return;
    if (direction === 'down' && !scrollableDown) return;

    setIsScrolling(true);

    pageContainer.current.style.transform = `translateY(${currentIndex == 0 ? "0%" : `-${currentIndex * 100}%`
      })`;

    setTimeout(() => {
      if (currentIndex < 0) currentIndex = 0;
      setCurrentIndex(currentIndex);
      
      setIsScrolling(false);
      setPreviousTouchMove(null);

      const currentPageRef = refs.current[currentIndex];
      if (currentPageRef && currentPageRef.scrollHeight <= currentPageRef.clientHeight) {
        setScrollableUp(true);
        setScrollableDown(true);
      }
      wheelTime = Date.now();
    }, 500);


    // if (currentPageRef && currentPageRef.classList.contains('overflow-auto') && currentPageRef.scrollHeight > currentPageRef.clientHeight) {
    //   setPreviousTouchMove(null);

    //   const currentPageScrollTop = currentPageRef.scrollTop;


    //   if (currentPageScrollTop <= 0) {

    //     setScrollableUp(true);
    //     setScrollableDown(false);
    //   } else if (currentPageRef.offsetHeight + currentPageRef.scrollTop >= currentPageRef.scrollHeight) {

    //     setScrollableUp(false);
    //     setScrollableDown(true);
    //   } else if (currentPageScrollTop > 0) {

    //     setScrollableUp(false);
    //     setScrollableDown(direction === 'up');
    //   }

    //   return;
    // }


    setScrollableUp(currentIndex > 0);
    setScrollableDown(currentIndex < pageCount - 1);
    
  }, [scrollableUp, scrollableDown, scrollable, pageCount]);

  const keyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isScrolling) {
        let newCurrentIndex: number;
        let direction: string;

        if (event.key === "ArrowDown" && scrollableDown) {
          newCurrentIndex = currentIndex + 1;
          direction = 'down';
        } else if (event.key === "ArrowUp" && scrollableUp) {
          newCurrentIndex = currentIndex - 1;
          direction = 'up';
        } else {
          return;
        }

        if (newCurrentIndex < 0 || newCurrentIndex > pageCount - 1) return;

        scrollPage(newCurrentIndex, direction);
      }
    },
    [pageCount, currentIndex, isScrolling, scrollPage, scrollableDown, scrollableUp]
  );
  
  
  const touchStart = useCallback((event: TouchEvent) => {
    setStartTouch({ x: event.touches[0].pageX, y: event.touches[0].pageY });
  }, []);

  const touchMove = useCallback(
    (event: TouchEvent) => {
      console.log('im touch');
      
      if ((event.target.closest('div[data-radix-scroll-area-viewport]') || event.target.closest('div[aria-roledescription="carousel"]')) && (Math.abs(startTouch.y - event.touches[0].clientY) <= Math.abs(startTouch.x - event.touches[0].clientX))) {
        return;
      }
      
      const currentPageRef = refs.current[currentIndex];

      // Disable next page when touch move down if the page scrollable and current scroll top is not end
      if (previousTouchMove 
        && currentPageRef.classList.contains('overflow-auto') 
        && currentPageRef.scrollHeight > currentPageRef.clientHeight 
        && event.touches[0].clientY <= previousTouchMove
        && currentPageRef.offsetHeight + currentPageRef.scrollTop - currentPageRef.scrollHeight < 0) {
        return;
      }
      
      if (previousTouchMove !== null && !isScrolling) {
        let newCurrentIndex: number;
        let direction: string;

        if (event.touches[0].clientY > previousTouchMove && currentPageRef.scrollTop <= 0) {
          newCurrentIndex = currentIndex - 1;
          direction = 'up';
        } else if (event.touches[0].clientY <= previousTouchMove && currentPageRef.offsetHeight + currentPageRef.scrollTop - currentPageRef.scrollHeight > -1) {
          newCurrentIndex = currentIndex + 1;
          direction = 'down';
        } else {
          setPreviousTouchMove(event.touches[0].clientY);
          return
        }
        
        if (newCurrentIndex < 0 || newCurrentIndex > pageCount - 1) return;
        
        console.log(`Scroll ${direction} by touch move`);
        scrollPage(newCurrentIndex, direction);
      } else {
        if (scrollableDown || scrollableUp) {
          setPreviousTouchMove(event.touches[0].clientY);
        }
      }
    },
    [pageCount, currentIndex, isScrolling, previousTouchMove, scrollPage, scrollableDown, scrollableUp, startTouch]
  );

  const wheelScroll: WheelEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (event.target.closest('div[data-radix-scroll-area-viewport]') && Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      const now = Date.now();

      if (wheelTime !== -1 && now - wheelTime < wheelThrottle) return;

      const currentPageRef = refs.current[currentIndex];

      if (isScrolling && currentPageRef.classList.contains('overflow-auto') && currentPageRef.scrollHeight > currentPageRef.clientHeight) {
        return;
      }
      
      // Disable next page when wheel down if the page scrollable and current scroll top is not end
      if (currentPageRef.classList.contains('overflow-auto') 
        && currentPageRef.scrollHeight > currentPageRef.clientHeight 
        && event.deltaY > 0
        && currentPageRef.offsetHeight + currentPageRef.scrollTop - currentPageRef.scrollHeight < 0) {
        return;
      }
      
      // Disable previous page when wheel up if the page scrollable and current scroll top is not start
      if (currentPageRef.classList.contains('overflow-auto') 
        && currentPageRef.scrollHeight > currentPageRef.clientHeight 
        && event.deltaY < 0
        && currentPageRef.scrollTop > 0) {
        return;
      }

      if (Math.abs(event.deltaY) > 1 && pageContainer.current && !isScrolling) {
        let newCurrentIndex: number;
        let direction: string;

        if (event.deltaY > 0 && scrollableDown) {
          newCurrentIndex = currentIndex + 1;
          direction = 'down';
        } else if (event.deltaY <= 0 && scrollableUp) {
          newCurrentIndex = currentIndex - 1;
          direction = 'up';
        } else {
          return;
        }

        if (newCurrentIndex < 0 || newCurrentIndex > pageCount - 1) return;

        console.log(`Scroll ${direction} by wheel event`);
        scrollPage(newCurrentIndex, direction);
      }
    },
    [pageCount, currentIndex, isScrolling, scrollPage, scrollableDown, scrollableUp]
  );

  const pageScroll: React.UIEventHandler<HTMLElement> = useCallback((event) => {
    const pageDom = event.target as HTMLElement
    
    if (pageDom.dataset.index != currentIndex.toString()) return;
    
    if (pageDom.classList.contains('overflow-auto') && pageDom.scrollHeight > pageDom.clientHeight && pageDom.offsetHeight + pageDom.scrollTop - pageDom.scrollHeight > -1) {
      console.log('Scroll down by scroll event');
      scrollPage(currentIndex + 1, 'down')
    }
    
    if (pageDom.classList.contains('overflow-auto') && pageDom.scrollHeight > pageDom.clientHeight && pageDom.scrollTop === 0) {
      console.log('Scroll up by scroll event');
      scrollPage(currentIndex - 1, 'up')
    }
    
    setLastScrollTop(pageDom.scrollTop);
    
    // if (scrollableUp && scrollableDown) return;

    // if (pageDom.scrollTop <= 0) {
    //   setIsScrolling(false);

    //   setScrollableUp(true);
    //   setScrollableDown(false);
    // } else if (pageDom.offsetHeight + pageDom.scrollTop - pageDom.scrollHeight > -1) {
    //   setIsScrolling(false);

    //   setScrollableUp(false);
    //   setScrollableDown(true);
    // } else {
    //   setIsScrolling(true);
    //   setScrollableUp(false);
    //   setScrollableDown(false);
    // }
  }, [scrollableUp, scrollableDown, currentIndex])

  useEffect(() => {
    if (!document) return;

    document.addEventListener("keyup", keyPress);
    document.addEventListener("touchmove", touchMove);
    document.addEventListener("touchstart", touchStart);

    return () => {
      document.removeEventListener("keyup", keyPress);
      document.removeEventListener("touchmove", touchMove);
      document.removeEventListener("touchstart", touchStart);
    };
  }, [keyPress, touchMove]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.body.scrollTo({ top: 0 });
  }, []);

  // If useNativeScroll is requested, render a simple scrollable container and
  // do not apply the slide/transform behaviour — this avoids the "stuck"
  // behaviour when the app no longer wants per-slide scrolling.
  if (useNativeScroll) {
    return (
      <div
        ref={scrollContainer}
        data-page-scroller="true"
        className={`w-full ${useNativeScroll ? 'overflow-auto' : 'overflow-hidden'}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={scrollContainer}
      data-page-scroller="true"
      className={`w-full h-dvh max-h-dvh ${useNativeScroll ? 'overflow-auto' : 'overflow-hidden'}`}
    >
      {/* <AnimatePresence propagate>
        {isScrolling && (
          <motion.div
            key={currentIndex}
            className={"fixed inset-0 w-full h-full bg-black z-10"}
            transition={{ duration: 0.7 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence> */}

      <div
        ref={pageContainer}
        {...(!useNativeScroll ? { onWheel: wheelScroll } : {})}
        className="w-full h-full"
        style={{
          transition: `transform ${500}ms ${"ease-in-out"}`,
        }}
      >
        {Children.map(children, (child, i) => {
          if (!isValidElement(child)) return

          return createElement(child.type, {
            ...child.props,
            ref: (ref: HTMLElement) => {
              refs.current[i] = ref
            },
            onScroll: pageScroll,
            "data-index": i
          })
        })}
      </div>
    </div >
  );
}
