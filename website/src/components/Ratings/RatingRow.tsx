import { useEffect, useState } from "react";
import RatingStars from "./StarRating";

interface RatingRowProps {
  avgRating: number;
  numRatings: number;
  className?: string;
}

const RatingRow: React.FC<RatingRowProps> = ({ avgRating, numRatings, className }) => {
const [avgRatingState, setAvgRating] = useState<number>(avgRating);
const [numRatingsState, setNumRatings] = useState<number>(numRatings);

  useEffect(() => {
    setAvgRating(avgRating);
    setNumRatings(numRatings);
  }, [avgRating, numRatings, className])

  return (
    <div className={`flex items-center ${className}`}>
      <RatingStars key={avgRating} rating={avgRatingState} />{" "}
      <p className="text-sm text-gray-500 ml-2">
        with {numRatingsState} ratings
      </p>{" "}
    </div>
  );
};

export default RatingRow;