export default function BubbleBackground(){ 
  return (
    <div className="bubble-bg" aria-hidden>
      <div style={{left:'-10%', top:'-10%'}} className="bubble w-72 h-72 bg-blue-200/60 animate-float" />
      <div style={{right:'-5%', top:'10%'}} className="bubble w-56 h-56 bg-pink-200/60 animate-[float_8s_ease-in-out_infinite]" />
      <div style={{left:'20%', bottom:'-8%'}} className="bubble w-80 h-80 bg-blue-100/50 animate-[float_10s_ease-in-out_infinite]" />
      <div style={{right:'20%', bottom:'-10%'}} className="bubble w-40 h-40 bg-pink-100/40 animate-[float_7s_ease-in-out_infinite]" />
    </div>
  );
}
