import type { Route } from "../routes/+types/stack-the-letter";

export function Letter(props: {
  letter: Route.ComponentProps["loaderData"]["letter"];
  boardLoaded: boolean;
}) {
  const { letter, boardLoaded } = props;

  return (
    <div className="pt-8 text-left w-full flex items-center justify-center">
      <div className="max-w-[376px] flex flex-col gap-2 border border-gray-600 p-4 rounded-xl">
        <h2>{letter.salutation}</h2>
        <p>{letter.message}</p>
        <p>{letter.regards}</p>
        {boardLoaded === true ? <p>Press Enter to try again.</p> : null}
      </div>
    </div>
  );
}
