import { useEffect, useState } from "react";
import './Countdown.css';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const Countdown = () => {
    const eventDate = new Date("2026-07-10T16:00:00");

    const calculateTimeLeft = (): TimeLeft => {
        const now = new Date();
        const difference = eventDate.getTime() - now.getTime();
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };

    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeLeft);
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="countdown">
            <h1>Event Countdown</h1>
            <div className="countdown-timer">
                <div className="time-unit">
                    <span className="time-value">{timeLeft.days}</span>
                    <span className="time-label">Days</span>
                </div>
                <div className="time-unit">
                    <span className="time-value">{timeLeft.hours}</span>
                    <span className="time-label">Hours</span>
                </div>
                <div className="time-unit">
                    <span className="time-value">{timeLeft.minutes}</span>
                    <span className="time-label">Minutes</span>
                </div>
                <div className="time-unit">
                    <span className="time-value">{timeLeft.seconds}</span>
                    <span className="time-label">Seconds</span>
                </div>
            </div>
        </div>
    );
};