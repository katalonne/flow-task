import { useState, useEffect } from "react";
import { differenceInMilliseconds, parseISO } from "date-fns";

interface CountdownState {
  timeLeft: string;
  isOverdue: boolean;
}

export function useCountdown(
  date: string,
  time: string,
  isScheduled: boolean
): CountdownState {
  const [state, setState] = useState<CountdownState>({
    timeLeft: "",
    isOverdue: false,
  });

  useEffect(() => {
    if (!isScheduled) return;

    const calculateTimeLeft = () => {
      const scheduledTime = parseISO(`${date}T${time}`);
      const now = new Date();
      const diff = differenceInMilliseconds(scheduledTime, now);

      if (diff <= 0) {
        setState({ timeLeft: "00d 00h 00m 00s", isOverdue: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const dDisplay = days > 0 ? `${days}d ` : "";
      const hDisplay = hours > 0 || days > 0 ? `${hours}h ` : "";
      const mDisplay = minutes > 0 || hours > 0 || days > 0 ? `${minutes}m ` : "";
      const sDisplay = `${seconds}s`;

      setState({
        timeLeft: dDisplay + hDisplay + mDisplay + sDisplay,
        isOverdue: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date, time, isScheduled]);

  return state;
}

