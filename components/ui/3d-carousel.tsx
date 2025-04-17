"use client"

import { memo, useEffect, useLayoutEffect, useState, useRef, useMemo } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"
import { ImageIcon } from "lucide-react"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1], filter: "blur(4px)" }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

interface PhotoItem {
  url: string;
  date?: string;
}

interface CarouselProps {
  handleClick: (photo: PhotoItem) => void
  controls: any
  cards: PhotoItem[]
  isCarouselActive: boolean
  onRotate: (value: number) => void
}

const Carousel = memo(
  ({ handleClick, controls, cards, isCarouselActive, onRotate }: CarouselProps) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    // Adjust cylinder width based on number of cards to prevent large gaps
    const baseWidth = isScreenSizeSm ? 1100 : 1800
    const faceCount = cards.length
    
    // Dynamically adjust cylinder width based on number of cards
    // Smaller width for fewer cards to keep them closer together
    const cylinderWidth = faceCount <= 1 ? baseWidth :
                          faceCount <= 3 ? baseWidth * 0.6 :
                          faceCount <= 5 ? baseWidth * 0.8 :
                          baseWidth
    
    // Ensure minimum width for each face to prevent overlap
    const faceWidth = faceCount > 0 ? Math.max(cylinderWidth / faceCount, 200) : 200
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1000px",
          WebkitPerspective: "1000px",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform",
        }}
      >
        <motion.div
          drag={isCarouselActive && faceCount > 0 ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          onDrag={(_, info) => {
            if (isCarouselActive && faceCount > 0) {
              const newValue = rotation.get() + info.offset.x * 0.05;
              rotation.set(newValue);
              onRotate(newValue);
            }
          }}
          onDragEnd={(_, info) => {
            if (isCarouselActive && faceCount > 0) {
              const newValue = rotation.get() + info.velocity.x * 0.05;
              controls.start({
                rotateY: newValue,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 30,
                  mass: 0.1,
                },
              });
              onRotate(newValue);
            }
          }}
          animate={controls}
        >
          {faceCount === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No images available</p>
              </div>
            </div>
          ) : (
            cards.map((photo, i) => (
              <motion.div
                key={`carousel-${i}`}
                className="absolute flex h-full origin-center items-center justify-center rounded-xl p-2"
                style={{
                  width: `${faceWidth}px`,
                  transform: `rotateY(${
                    i * (360 / faceCount)
                  }deg) translateZ(${radius}px)`,
                }}
                onClick={() => handleClick(photo)}
              >
                <div className="flex flex-col items-center">
                  {photo.date && (
                    <div className="mb-2 text-center text-sm font-medium text-primary bg-background/80 px-2 py-1 rounded-md backdrop-blur-sm">
                      {photo.date}
                    </div>
                  )}
                  <motion.img
                    src={photo.url}
                    alt=""
                    layoutId={`img-${photo.url}`}
                    className="pointer-events-none w-full max-w-[200px] max-h-[200px] rounded-xl object-cover aspect-square"
                    initial={{ filter: "blur(4px)" }}
                    layout="position"
                    animate={{ filter: "blur(0px)" }}
                    transition={transition}
                  />
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    )
  }
)

interface ThreeDPhotoCarouselProps {
  cards: string[] | { fullImage: string; date: string }[]
}

export function ThreeDPhotoCarousel({ cards }: ThreeDPhotoCarouselProps) {
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const controls = useAnimation()
  const [rotationValue, setRotationValue] = useState(0)
  const fullscreenImgRef = useRef<HTMLImageElement>(null)
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)
  
  // Process cards to ensure consistent format
  const processedCards = useMemo(() => {
    if (!Array.isArray(cards)) return [];
    
    return cards.map(card => {
      if (typeof card === 'string') {
        return { url: card };
      } else if (card && typeof card === 'object' && 'fullImage' in card) {
        return {
          url: card.fullImage,
          date: card.date
        };
      }
      return { url: '' };
    }).filter(card => card.url);
  }, [cards]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen =
        document.fullscreenElement !== null ||
        // @ts-ignore - Safari
        document.webkitFullscreenElement !== null ||
        // @ts-ignore - Firefox
        document.mozFullScreenElement !== null ||
        // @ts-ignore - IE/Edge
        document.msFullscreenElement !== null;
      
      setIsFullscreen(isInFullscreen);
      
      // If exiting fullscreen, reset the carousel
      if (!isInFullscreen) {
        handleClose();
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    }
  }, []);

  const enterFullscreen = async (element: HTMLElement) => {
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        // @ts-ignore - Safari
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        // @ts-ignore - Firefox
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        // @ts-ignore - IE/Edge
        await element.msRequestFullscreen();
      } else {
        console.log("Fullscreen API is not supported in this browser");
      }
    } catch (error) {
      console.error("Error attempting to enable fullscreen:", error);
    }
  }

  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore - Safari
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        // @ts-ignore - Firefox
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        // @ts-ignore - IE/Edge
        document.msExitFullscreen();
      }
    } catch (error) {
      console.error("Error attempting to exit fullscreen:", error);
    }
  }

  const handleClick = (photo: PhotoItem) => {
    setActiveImg(photo.url);
    setIsCarouselActive(false);
    controls.stop();
  }

  const handleClose = () => {
    if (isFullscreen) {
      exitFullscreen();
    }
    setActiveImg(null);
    setIsCarouselActive(true);
  }
  
  const toggleFullscreen = () => {
    if (fullscreenContainerRef.current) {
      if (!isFullscreen) {
        enterFullscreen(fullscreenContainerRef.current);
      } else {
        exitFullscreen();
      }
    }
  }

  return (
    <motion.div layout className="relative flex items-center">
      <AnimatePresence mode="sync">
        {activeImg && (
          <motion.div
            ref={fullscreenContainerRef}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeImg}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 rounded-none"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.img
                ref={fullscreenImgRef}
                layoutId={`img-${activeImg}`}
                src={activeImg}
                className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg cursor-pointer"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{ willChange: "transform" }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the overlay's onClick from firing
                  toggleFullscreen();
                }}
              />
              <button
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button
                className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
              >
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                    <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                    <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                    <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navigation Buttons */}
      <button
        onClick={() => {
          const newValue = rotationValue - 36;
          controls.start({
            rotateY: newValue,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 30,
              mass: 0.1,
            },
          });
          setRotationValue(newValue);
        }}
        className="absolute left-2 z-10 bg-primary/80 hover:bg-primary text-white rounded-full p-2 shadow-md"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      
      <div className="relative h-[500px] w-full overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={processedCards}
          isCarouselActive={isCarouselActive}
          onRotate={setRotationValue}
        />
      </div>
      
      <button
        onClick={() => {
          const newValue = rotationValue + 36;
          controls.start({
            rotateY: newValue,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 30,
              mass: 0.1,
            },
          });
          setRotationValue(newValue);
        }}
        className="absolute right-2 z-10 bg-primary/80 hover:bg-primary text-white rounded-full p-2 shadow-md"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </motion.div>
  )
}