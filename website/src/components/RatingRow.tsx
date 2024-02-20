import RatingStars from "./StarRating";

interface RatingRowProps {
  avgRating: number;
  numRatings: number;
  className?: string;
}

const RatingRow: React.FC<RatingRowProps> = ({ avgRating, numRatings, className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <RatingStars rating={avgRating || 0} />{" "}
      <p className="text-sm text-gray-500 ml-2">
        with {numRatings || 0} ratings
      </p>{" "}
    </div>
  );
};

export default RatingRow;