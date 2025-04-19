"use client";

import { useState, useEffect, useRef } from "react";
import { useThemeContext } from "@/components/theme-provider";
// Removed framer‑motion; new loader is pure CSS

interface LoadingScreenProps {
  isLoading?: boolean;
}

export default function LoadingScreen({ isLoading = true }: LoadingScreenProps) {
  const [visible, setVisible] = useState(isLoading);
  const [barDone, setBarDone] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const { themeColor } = useThemeContext();

  // wait for bar fill
  useEffect(() => {
    if (!barRef.current) return;
    const done = () => setTimeout(() => setBarDone(true), 300);
    barRef.current.addEventListener("animationend", done);
    return () => barRef.current?.removeEventListener("animationend", done);
  }, []);

  // hide when parent finished and bar filled
  useEffect(() => {
    if (!isLoading && barDone) {
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading, barDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        paddingTop: "env(safe-area-inset-top,0px)",
        paddingBottom: "env(safe-area-inset-bottom,0px)",
        marginTop: "calc(env(safe-area-inset-top,0px)*-1)",
        height:
          "calc(100vh + env(safe-area-inset-top,0px) + env(safe-area-inset-bottom,0px))",
      }}
    >
      {/* background gradient + bokeh (unchanged) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700 bg-[length:400%_400%] animate-[gradientBG_12s_ease_infinite]">
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[40px] opacity-20 bg-blue-400 top-[10%] left-[15%] animate-[driftFade_22s_infinite_linear_alternate] -animation-delay-[5s]"></div>
        <div className="absolute w-[200px] h-[200px] rounded-full blur-[40px] opacity-20 bg-purple-400 bottom-[15%] right-[20%] animate-[driftFade_19s_infinite_linear_alternate] -animation-delay-[2s]"></div>
        <div className="absolute w-[150px] h-[150px] rounded-full blur-[40px] opacity-15 bg-yellow-400 top-[40%] right-[30%] animate-[driftFade_25s_infinite_linear_alternate] -animation-delay-[10s]"></div>
        <div className="absolute w-[250px] h-[250px] rounded-full blur-[40px] opacity-[0.18] bg-emerald-400 bottom-[30%] left-[25%] animate-[driftFade_18s_infinite_linear_alternate] -animation-delay-[8s]"></div>
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
        <h1 className="text-5xl font-bold mb-32 tracking-tight opacity-0 animate-[fadeInScaleUp_1.5s_ease-out_forwards] font-['Black_Ops_One'] text-white">
          LiftMate
        </h1>

        {/* new bench‑press loader */}
        <div className="gym-loader mb-10 mx-auto scale-[0.6]">
          <div className="box">
            <div className="bench">
              <div className="support">
                <div className="stand">
                  <div className="grd1">
                    <div className="dmbl1"></div>
                    <div className="dmbl2"></div>
                    <div className="dmbl3"></div>
                    <div className="dmbl4"></div>
                    <div className="dmbl5"></div>
                    <div className="dmbl6"></div>
                    <div className="dmbl7"></div>
                    <div className="dmbl8"></div>
                    <div className="dmbl9"></div>
                    <div className="dmbl10"></div>
                    <div className="dmbl11"></div>
                    <div className="dmbl12"></div>
                  </div>
                </div>
              </div>
              <div className="hanger">
                <div className="hook"></div>
                <div className="grd2"></div>
              </div>
              <div className="leg1"><div className="shoe"></div></div>
              <div className="leg2"><div className="shoe1"></div></div>
              <div className="thy"></div>
              <div className="belt"></div>
              <div className="stomach"></div>
              <div className="stomach2"></div>
              <div className="chest"></div>
              <div className="chest2"></div>
              <div className="armpit"></div>
              <div className="hand">
                <div className="dumbell">
                  <div className="circle1"></div>
                  <div className="circle2"></div>
                  <div className="circle3"></div>
                </div>
              </div>
              <div className="neck"></div>
              <div className="head">
                <div className="lip1"></div>
                <div className="lip2"></div>
                <div className="hair"></div>
              </div>
            </div>
          </div>
        </div>

        {/* loading bar */}
        <div className="w-[60%] max-w-[300px] h-[10px] bg-black/30 rounded-md mt-32 mb-1 mx-auto overflow-hidden relative">
          <div
            ref={barRef}
            className="h-full rounded-md animate-[fillBar_3.5s_linear_forwards] animation-delay-[0.5s]"
            style={{ width: "0%", backgroundColor: "var(--md-primary)" }}
          ></div>
        </div>

        {/* text */}
        <div className="text-lg text-gray-100 opacity-0 animate-[fadeIn_2s_ease-in_forwards] font-['Inter']">
          Loading your progress
          <span className="inline-block opacity-0 animate-[loadingDots_1.4s_infinite]">.</span>
          <span className="inline-block opacity-0 animate-[loadingDots_1.4s_infinite] animation-delay-[0.2s]">.</span>
          <span className="inline-block opacity-0 animate-[loadingDots_1.4s_infinite] animation-delay-[0.4s]">.</span>
        </div>
      </div>

      {/* scoped CSS */}
      <style jsx global>{`
:start_line:135
-------
:start_line:135
-------
:start_line:135
-------
:start_line:135
-------
:start_line:135
-------
        .gym-loader *{box-sizing:border-box;}
        .gym-loader{position:relative;}
        /* --- benches and parts (prefixed) --- */
        .gym-loader .bench{position:absolute;top:85%;left:50%;transform:translateX(-50%);width:330px;height:10px;background:#476098;border-radius:10px;}
        .gym-loader .support{position:absolute;background:#222;top:100%;left:3%;width:310px;height:5px;border-radius:5px;}
        .gym-loader .hanger{background:#333;position:absolute;left:90%;top:-1500%;width:15px;height:260px;}
        .gym-loader .hook{position:absolute;background:#333;top:10%;left:-100%;width:20px;height:3px;}
        .gym-loader .stand{position:absolute;background:#333;top:10%;left:10%;width:15px;height:102px;border-radius:1px;}
        .gym-loader .grd1{position:absolute;top:95%;left:-140%;width:55px;height:10px;background:#333;}
        .gym-loader .grd2{position:absolute;top:99%;left:-160%;width:65px;height:10px;background:#333;}
        .gym-loader .dmbl1,.gym-loader .dmbl2{position:absolute;top:-300%;width:40px;height:40px;border-radius:100%;}
        .gym-loader .dmbl1{left:-400%;background:#444;}
        .gym-loader .dmbl2{left:-350%;background:#009688;}
        .gym-loader .dmbl3{position:absolute;top:-150%;left:-375%;width:15px;height:8px;background:#999;border-radius:6px;}
        .gym-loader .dmbl4{position:absolute;top:-150%;left:-322%;width:10px;height:10px;background:#111;border-radius:10px;}
        .gym-loader .dmbl5{position:absolute;top:-300%;left:150%;width:20px;height:40px;background:#444;border-radius:5px;}
        .gym-loader .dmbl6{position:absolute;top:-300%;left:250%;width:20px;height:40px;background:#444;border-radius:5px;}
        .gym-loader .dmbl7{position:absolute;top:-150%;left:170%;width:100%;height:6px;background:#444;border-radius:10px;}
        .gym-loader .dmbl8{position:absolute;top:-800%;left:380%;width:10px;height:90px;background:#666;border-radius:2px;}
        .gym-loader .dmbl9{position:absolute;top:-550%;left:360%;width:20px;height:40px;background:#666;border-radius:5px;}
        .gym-loader .dmbl10{position:absolute;top:-800%;left:660%;width:10px;height:90px;background:#666;border-radius:2px;}
        .gym-loader .dmbl11{position:absolute;top:-550%;left:660%;width:20px;height:40px;background:#666;border-radius:5px;}
        .gym-loader .dmbl12{position:absolute;top:-400%;left:340%;width:380%;height:8px	background:#666;border-radius:10px;}
        .gym-loader .leg1,.gym-loader .leg2{position:absolute;background:#FDA76D;height:126px;width:15px;top:-210%;border-radius:7px;transform:rotate(-15deg);animation:movement 3s infinite linear;}
        .gym-loader .leg2{background:#FDA050;left:-7%;z-index:10;}
        .gym-loader .shoe,.gym-loader .shoe1{position:absolute;background:#333;height:20px;width:40px;top:95%;left:-150%;border-radius:5px;}
        .gym-loader .shoe1{background:#555;}
        .gym-loader .thy{position:absolute;background:#61967B;width:156px;height:20px;top:-220%;left:-11%;border-radius:7px;z-index:90;animation:thym 3s infinite linear;}
        .gym-loader .belt{position:absolute;background:#8BC34A;width:15px;height:45px;top:-450%;left:20%;border-radius:3px;z-index:100;}
        .gym-loader .stomach{position:absolute;background:#cf4645;width:86px;height:35px;top:-350%;left:20%;border-radius:7px;z-index:90;}
        .gym-loader .stomach2{position:absolute;background:#FF8A65;width:56px;height:30px;top:-470%;left:21%;border-radius:5px;z-index:10;transform:rotate(-15deg);}
        .gym-loader .chest{position:absolute;background:#cf4645;width:86px;height:60px;top:-600%;left:35%;border-radius:40px;z-index:11;animation:inex 3s infinite linear;}
        .gym-loader .chest2{position:absolute;background:#FF8A65;width:103px;height:80px;top:-820%;left:30%;border-radius:60px;z-index:10;animation:inex 3s infinite linear;}
        .gym-loader .armpit{position:absolute;background:#f8a781;width:46px;height:26px;top:-250%;left:42%;border-radius:60px;z-index:90;}
        .gym-loader .hand{position:absolute;background:#Fda76d;width:36px;height:136px;top:-100%;left:45%;border-radius:60px;transform:translateY(-60%);animation:lift 3s infinite linear;}
        .gym-loader .dumbell{position:absolute;top:0%;left:-75%;background:#222;width:110px;height:110px;border-radius:100%;transform:translateY(-60%);}
        .gym-loader .circle1{position:absolute;top:5%;left:5%;background:#0077B5;width:100px;height:100px;border-radius:100%;}
        .gym-loader .circle2{position:absolute;top:15%;left:15%;background:#222;width:80px;height:80px;border-radius:100%;}
        .gym-loader .circle3{position:absolute;top:42%;left:42%;background:#eee;width:20px;height:20px;border-radius:100%;}
        .gym-loader .neck{position:absolute;background:#cf4645;width:25px;height:46px;top:-450%;left:54%;border-radius:10px;}
        .gym-loader .head{position:absolute;background:#Fda76d;width:66px;height:40px;top:-400%;left:59%;border-radius:5px;animation:hm 3s infinite linear;}
        .gym-loader .hair{position:absolute;background:#212121;width:16px;height:46px;top:-10%;left:90%;border-radius:2px;}
        .gym-loader .lip1{position:absolute;background:#fda76d;width:5px;height:6px;top:-10%;left:50%;border-radius:5px;animation:exin 3s infinite linear;}
        .gym-loader .lip2{position:absolute;background:#fda76d;width:5px;height:6px;top:-10%;left:55%;border-radius:5px;}

        /* keyframes copied as‑is (only once) */
        @keyframes movement{0%{transform:rotate(-10deg);}40%{transform:rotate(-10deg);}50%{transform:rotate(10deg);}65%{transform:rotate(10deg);}100%{transform:rotate(-10deg);}}
        @keyframes thym{0%{left:-11%;}40%{left:-11%;}50%{left:-6%;}65%{left:-6%;}100%{left:-11%;}}
        @keyframes lift{0%{top:-100%;}40%{top:-100%;}50%{top:-670%;}65%{top:-670%;}100%{top:-100%;}}
        @keyframes inex{0%{transform:translateY(0%);}35%{transform:translateY(0%);}50%{transform:translateY(5%);}100%{transform:translateY(0%);}}
        @keyframes exin{0%{left:35%;}45%{left:35%;}50%{left:45%;top:-10%;}65%{left:45%;}100%{left:35%;}}
        @keyframes hm{0%{transform:rotate(0deg);}35%{transform:rotate(0deg);top:-400%;}50%{transform:rotate(-15deg);top:-460%;}53%{transform:rotate(-15deg);top:-460%;}56%{transform:rotate(0deg);top:-400%;}59%{transform:rotate(-4deg);top:-410%;}62%{transform:rotate(-2deg);top:-405%;}65%{transform:rotate(0deg);top:-400%;}100%{transform:rotate(0deg);}}
        `}
      </style>
    </div>
  );
}

