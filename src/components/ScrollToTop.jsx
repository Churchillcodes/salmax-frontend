import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // 'key' is a unique string generated for every single navigation action
  const { key } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]); // Triggers on every page change AND same-page link click

  return null;
}
