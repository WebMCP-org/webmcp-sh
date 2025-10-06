import { Container } from "@/components/container";
import { Metadata } from "next";
import { getBlogFrontMatterBySlug, getSingleBlog } from "@/lib/blogs";
import { redirect } from "next/navigation";
import { DivideX } from "@/components/divide";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const data = await params;
  const frontmatter = await getBlogFrontMatterBySlug(data.slug);

  if (!frontmatter) {
    return {
      title: "Blog not found",
    };
  }

  return {
    title: frontmatter.title + " by Manu Arora",
    description: frontmatter.description,
  };
}

export default async function SingleBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const data = await params;
  const blog = await getSingleBlog(data.slug);

  if (!blog) {
    redirect("/blog");
  }

  const { content, frontmatter } = blog;

  console.log(frontmatter);

  return (
    <div>
      <DivideX />
      <Container className="border-divide border-x px-8 pt-10 md:pt-20 md:pb-10">
        <img
          src={frontmatter.image}
          alt={frontmatter.title}
          className="rouned-full mx-auto mb-20 max-h-96 w-full max-w-2xl rounded-2xl object-cover shadow-xl"
        />
        <div className="prose prose-base dark:prose-invert mx-auto">
          {content}
        </div>
      </Container>
      <DivideX />
    </div>
  );
}
