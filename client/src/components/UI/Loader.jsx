export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-wrapper">
      <div className="loader"></div>
      <p className="loader-text">{text}</p>
    </div>
  );
}
