import styled from "styled-components";

const Loader = ({ label = "Loading preview..." }: { label?: string }) => {
  return (
    <Wrapper role="status" aria-live="polite" aria-label={label}>
      <div className="loader">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="label">{label}</span>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px 0;

  .loader {
    --color-blue: #003875;
    --color-orange: #dc7527;
    --size: 70px;
    width: var(--size);
    height: var(--size);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
  }

  .loader span {
    width: 100%;
    height: 100%;
    background-color: var(--color-blue);
    animation: keyframes-blink 0.6s alternate infinite linear;
  }

  .loader span:nth-child(1) {
    background-color: var(--color-blue);
    animation-delay: 0ms;
  }

  .loader span:nth-child(2) {
    background-color: var(--color-orange);
    animation-delay: 200ms;
  }

  .loader span:nth-child(3) {
    background-color: var(--color-blue);
    animation-delay: 300ms;
  }

  .loader span:nth-child(4) {
    background-color: var(--color-orange);
    animation-delay: 400ms;
  }

  .loader span:nth-child(5) {
    background-color: var(--color-blue);
    animation-delay: 500ms;
  }

  .loader span:nth-child(6) {
    background-color: var(--color-orange);
    animation-delay: 600ms;
  }

  @keyframes keyframes-blink {
    0% {
      opacity: 0.3;
      transform: scale(0.5) rotate(5deg);
    }

    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .label {
    font-family: "Space Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #003875;
    opacity: 0.75;
  }
`;

export default Loader;
