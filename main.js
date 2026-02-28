console.clear();

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip, MotionPathPlugin, SplitText);

// Initialize ScrollSmoother
let smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: 1.5,               // Smoothness (seconds)
  effects: true,             // Enable effects like data-speed
  normalizeScroll: true,     // Force scroll on touch devices to improve smoothness
  ignoreMobileResize: true,
  preventDefault: true
});

// Refresh ScrollTrigger when images load to fix any layout offset bugs
window.addEventListener('load', () => ScrollTrigger.refresh());

/* -----------------------------------------
   1. SCRUBBED BENTO GALLERY
----------------------------------------- */
let flipCtx;
const createBentoGallery = () => {
  let galleryElement = document.querySelector("#gallery-8");
  if (!galleryElement) return;
  let galleryItems = galleryElement.querySelectorAll(".gallery__item");

  flipCtx && flipCtx.revert();
  galleryElement.classList.remove("gallery--final");

  flipCtx = gsap.context(() => {
    // Temporarily add final class to capture state
    galleryElement.classList.add("gallery--final");
    const flipState = Flip.getState(galleryItems);
    galleryElement.classList.remove("gallery--final");

    const flip = Flip.to(flipState, {
      simple: true,
      ease: "expoScale(1, 5)"
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".bento-section",
        start: "top top",
        end: "+=150%",
        scrub: 1,
        pin: true
      }
    });

    // Fade out heroic text when scrubbing starts
    tl.to(".bento-overlay-text", { opacity: 0, duration: 0.1, ease: "power1.inOut" }, 0);
    tl.add(flip, 0); // Start flip at the same time

    return () => gsap.set(galleryItems, { clearProps: "all" });
  });
};
createBentoGallery();
window.addEventListener("resize", createBentoGallery);

/* -----------------------------------------
   2. CONTAINER ANIMATION (SPLIT TEXT)
----------------------------------------- */
let wrapper = document.querySelector(".Horizontal");
let text = document.querySelector(".Horizontal__text");

// Initialize SplitText
let split = new SplitText(".Horizontal__text", { type: "chars, words" });

// The horizontal scrolling tween for the container
const scrollTween = gsap.to(text, {
  xPercent: -100,
  ease: "none",
  scrollTrigger: {
    trigger: wrapper,
    pin: true,
    start: "top top",
    end: "+=4000px",  // Extend end point for a more comfortable reading pace
    scrub: true
  }
});

// Animate each character within the horizontally moving container
split.chars.forEach((char) => {
  gsap.from(char, {
    yPercent: "random(-150, 150)", // Randomize starting Y
    rotation: "random(-45, 45)",   // Randomize starting rotation
    opacity: 0,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: char,
      containerAnimation: scrollTween, // Magic connecting it to horizontal scroll
      start: "left 95%",
      end: "left 35%",
      scrub: 1
    }
  });
});

/* -----------------------------------------
   3. MOTIONPATH (PLOT THROUGH POINTS)
----------------------------------------- */
let motionCtx;
function createMotionTimeline() {
  motionCtx && motionCtx.revert(); // Support for resizing gracefully

  motionCtx = gsap.context(() => {
    const box = document.querySelector(".box");
    if (!box) return;
    const boxStartRect = box.getBoundingClientRect();

    // Grab all destination containers except the first
    const containers = gsap.utils.toArray(".container-box:not(.initial)");

    // Calculate relative path points
    const points = containers.map((container) => {
      const marker = container.querySelector(".marker") || container;
      const r = marker.getBoundingClientRect();
      
      return {
        x: r.left + r.width / 2 - (boxStartRect.left + boxStartRect.width / 2),
        y: r.top + r.height / 2 - (boxStartRect.top + boxStartRect.height / 2)
      };
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".container-box.initial",
        start: "clamp(top center)",
        endTrigger: ".final",
        end: "clamp(top center)",
        scrub: 1.5 // Added tiny smoothing duration
      }
    });

    tl.to(".box", {
      duration: 1,
      ease: "none",
      motionPath: {
        path: points, 
        curviness: 1.5 
      }
    });
  });
}
createMotionTimeline();
window.addEventListener("resize", createMotionTimeline);

/* -----------------------------------------
   4. HORIZONTAL SCROLLING PORTFOLIO
----------------------------------------- */
if (document.getElementById("portfolio")) {
  const horizontalSections = gsap.utils.toArray(".horiz-gallery-wrapper");

  horizontalSections.forEach(function (sec) {
    const pinWrap = sec.querySelector(".horiz-gallery-strip");
    if (!pinWrap) return;

    let pinWrapWidth;
    let horizontalScrollLength;

    function refresh() {
      pinWrapWidth = pinWrap.scrollWidth;
      horizontalScrollLength = pinWrapWidth - window.innerWidth;
    }

    refresh();

    // Pinning and horizontal scrolling
    gsap.to(pinWrap, {
      scrollTrigger: {
        scrub: 1,
        trigger: sec,
        pin: sec,
        start: "center center",
        end: () => `+=${pinWrapWidth}`, // Scroll duration equals width of the contents
        invalidateOnRefresh: true       // Recalculate on refresh
      },
      x: () => -horizontalScrollLength,
      ease: "none"
    });

    ScrollTrigger.addEventListener("refreshInit", refresh);
  });
}
