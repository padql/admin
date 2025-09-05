export default function Loading(){ 
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
}
