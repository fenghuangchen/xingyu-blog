> 每次大版本升级，真正花时间的都不是新特性，而是那些「以前能跑」的细节。

这个站点就是用 Next.js 16 搭的。迁移过程不算痛苦，但有三个地方让我停下来查了很久，记在这里，给同样在升级的人省一点时间。

## 一、params 和 searchParams 都变成了 Promise

在 Next.js 15 里这只是个警告，到了 16，同步读取会直接报错。

```tsx
// 以前
export default function Page({ params }: { params: { slug: string } }) {
  return <Article slug={params.slug} />;
}

// 现在
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Article slug={slug} />;
}
```

`cookies()`、`headers()`、`draftMode()` 同理，都要 `await`。一开始会觉得啰嗦，但它让「这个组件是动态的」变得显式。

## 二、Turbopack 默认开启之后

开发服务器确实快了很多，但有两类问题会更早暴露：

1. 依赖里用了 Node 原生模块；
2. 客户端组件不小心引用了服务端代码。

我的处理方式是把数据库访问全部收进 `lib/db.ts`，并且在组件树里只从 Server Component 调用。只要客户端组件不碰它，打包器就不会把 `node:sqlite` 拖进浏览器。

## 三、缓存不再是「默认帮你做」

Next.js 16 对缓存的默认行为更保守了。以前随手一个 `fetch` 就可能被静态化，现在需要你明确表达意图。

| 场景 | 写法 |
| --- | --- |
| 每次请求都读最新数据 | 使用 `cookies()` 等动态 API |
| 明确缓存一段时间 | `fetch(url, { next: { revalidate: 60 } })` |
| 构建时静态生成 | `generateStaticParams` |

对个人博客来说，这反而是好事：动态页面就老老实实动态渲染，不需要和缓存斗智斗勇。

## 一个额外的小发现

Next.js 16 对 React 19 的支持更完整了。`useOptimistic` 和 Server Actions 配合起来，做留言、点赞这类交互非常顺手。这个站点目前的留言走的是普通 API Route，下一步我打算改成 Server Action，把「提交后刷新」的体验再打磨一下。

## 写在最后

升级本身不是目的。真正值得花时间的，是借这次升级把项目里那些「不知道为什么能跑」的地方重新想一遍。

如果你也在从 15 迁到 16，欢迎把踩到的坑留在留言板，我们一起补全这份清单。
