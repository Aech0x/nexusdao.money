interface CardProps {
  title: string
  value?: string
}

const Card: React.FC<CardProps> = ({ title, value, children }) => {
  return (
    <div className="flex flex-col justify-center rounded-lg py-4 bg-white drop-shadow-md items-center">
      <span className="text-lg font-semibold text-gray-500">{title}</span>
      {value != null ? (
        <span className="text-2xl font-bold">{value}</span>
      ) : (
        children
      )}
    </div>
  )
}

export default Card
