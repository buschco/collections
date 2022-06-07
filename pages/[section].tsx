/* eslint-disable react/no-unescaped-entities */
import Editor from "@monaco-editor/react";
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ReactMarkdownProps } from "react-markdown/lib/complex-types";
import rehypeHighlight from "rehype-highlight";

const C = ({ className, ...props }: React.HTMLProps<HTMLSpanElement>) => (
  <code className={`p-1 bg-gray-100 rounded-md ${className}`} {...props} />
);

const sections: Record<string, any> = {
  first: {
    title: "1: Create new array from array with map",
    description: `
### Context
The \`map\` function is like a transform function for every item. It returns a new array based from the previous one, with the items returned from the callback function.

### Example

    // [ { name: 'Bob' }, { name: 'Alice' } ]
    array.map(item => item.name)
    // [ 'Bob', 'Alice' ]
   
### Task
Use the \`map\` function to create an array of the names of the balls.`,
    nextSection: "second",
    initialCode: "balls.map()",
    data: [
      { name: "baseball", size: 1 },
      { name: "basketball", size: 3 },
      { name: "tennisball", size: 1 },
      { name: "volleyball", size: 2 },
      { name: "football", size: 2 },
    ],
    expected: [
      "baseball",
      "basketball",
      "tennisball",
      "volleyball",
      "football",
    ],
  },
  second: {
    title: "2. Add an attribute",
    nextSection: "third",
    initialCode: `balls.map((ball) => {
  return ball
})`,
    description: `
### Context
If you need to add a prop to the items Javascript gives us the spread operator: \`...\`. It will copy the keys and values into the target structure.

### Example

    let bob = { name: 'Bob' }
    bob = { ...bob, age: 24 }
    bob = { ...bob, favoriteFood: 'Pasta' }
    // bob -> { name: 'Bob', age: 24, favoriteFood: 'Pasta' }
   
### Task
Use the \`map\` function with the spread operator to add \`sport: true\` to each item`,
    data: [
      { name: "baseball", size: 1 },
      { name: "basketball", size: 3 },
      { name: "tennisball", size: 1 },
      { name: "volleyball", size: 2 },
      { name: "football", size: 2 },
    ],
    expected: [
      { name: "baseball", size: 1, sport: true },
      { name: "basketball", size: 3, sport: true },
      { name: "tennisball", size: 1, sport: true },
      { name: "volleyball", size: 2, sport: true },
      { name: "football", size: 2, sport: true },
    ],
  },
  third: {
    title: "3. Filter",
    description: `
### Context
With the \`filter\` function, you can create a new, filtered array. The \`filter\` callback, needs to return falsy (\`false\`), for the item to be filtered from the array.

### Example

    let bob = { name: 'Bob' }
    bob = { ...bob, age: 24 }
    bob = { ...bob, favoriteFood: 'Pasta' }
    // bob -> { name: 'Bob', age: 24, favoriteFood: 'Pasta' }
   
### Task

Use the \`filter\` function to create a new array containing all balls with a size greater than 1.`,
    nextSection: "third",
    initialCode: "balls.filter(() => true)",
    data: [
      { name: "baseball", size: 1 },
      { name: "basketball", size: 3 },
      { name: "tennisball", size: 1 },
      { name: "volleyball", size: 2 },
      { name: "football", size: 2 },
    ],
    expected: [
      { name: "basketball", size: 3 },
      { name: "volleyball", size: 2 },
      { name: "football", size: 2 },
    ],
  },
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: false,
    paths: Object.keys(sections).map((key) => ({ params: { section: key } })),
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const section = context.params?.section;
  if (
    section == null ||
    typeof section !== "string" ||
    sections[section] == null
  )
    return { props: sections.first };
  return { props: sections[section] };
};

const Markdown = (props: React.ComponentProps<typeof ReactMarkdown>) => (
  <ReactMarkdown
    rehypePlugins={[rehypeHighlight]}
    components={{
      code: ({ className, inline, ...props }) => (
        <C className={className} {...props} />
      ),
      h3: (props) => <h3 {...props} className="text-lg font-bold mt-2" />,
    }}
    {...props}
  />
);

const Section: NextPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { nextSection, data, expected, title, initialCode, description } =
    props;
  const [code, setCode] = useState<string>(initialCode);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const matches =
    result == null ? null : JSON.stringify(expected) === JSON.stringify(result);

  return (
    <div className="flex items-center flex-col container mx-auto">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-12 px-12 lg:px-36 w-full flex flex-col">
        <h1 className="text-2xl font-bold mb-1">{title}</h1>

        <Markdown>{description}</Markdown>

        <Editor
          className="mt-8"
          height="40vh"
          defaultLanguage="javascript"
          value={code}
          onChange={(nextCode) => setCode(nextCode ?? "")}
          theme="vs-dark"
        />

        <button
          type="button"
          className="cursor-pointer my-2 py-1 bg-green-400 rounded-lg self-start px-4"
          onClick={() => {
            const codeToExecute = [
              `const balls = JSON.parse('${JSON.stringify(data)}');`,
              code,
            ].join("\n");

            console.log(codeToExecute);
            try {
              const nextResult = eval(codeToExecute);

              setResult(nextResult);
            } catch (error) {
              if (error instanceof Error) {
                setError(error);
              }
            }
          }}
        >
          Run
        </button>

        {error != null && (
          <span className="font-mono text-red-500">{error.message}</span>
        )}

        <h3 className="mt-4 text-xl font-semibold">Result</h3>
        <C className="mt-2 text-sm self-start">{JSON.stringify(result)}</C>

        <h3 className="mt-4 text-xl font-semibold">Expected</h3>
        <C className="mt-2 text-sm self-start">{JSON.stringify(expected)}</C>

        {matches === true ? (
          <div className="flex flex-col mt-8">
            <h3 className="text-2xl mt-2 font-bold">Nice Job ✅</h3>
            <Link href={nextSection}>
              <a className="cursor-pointer mt-2 py-2 bg-blue-600 text-white shadow-lg rounded-lg self-start px-4">
                Next Section
              </a>
            </Link>
          </div>
        ) : matches === false ? (
          <div className="flex flex-col mt-8">
            <h3 className="text-2xl mt-2 font-bold">Results differ 🧐</h3>
            <Link href={nextSection}>
              <a className="text-sm cursor-pointer self-start">Skip Section</a>
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Section;
