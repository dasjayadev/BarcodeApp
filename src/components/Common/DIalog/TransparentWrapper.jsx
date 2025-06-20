const TransparentWrapper = ({ children }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      {children}
    </div>
  )
}

export default TransparentWrapper
