> 一个不会停下来的 Agent，比一个不会思考的 Agent 更危险。

最近在给一个内部工具写 Agent 循环。需求听起来很简单：查资料、写结论、必要时调用工具。真正写起来才发现，最难的部分不是「让它做事」，而是「让它知道什么时候该停」。

## 先把循环写出来

ReAct 的核心其实只有三句话：观察、思考、行动。把它翻译成代码，一个最小循环长这样：

```python
def react_loop(question: str, tools: dict, max_steps: int = 6):
    scratchpad = ""
    for step in range(max_steps):
        prompt = build_prompt(question, scratchpad, tools)
        action = call_model(prompt)

        if action["type"] == "final":
            return action["answer"]

        observation = tools[action["name"]](**action["args"])
        scratchpad += "\nThought: " + action["thought"]
        scratchpad += "\nAction: " + action["name"]
        scratchpad += "\nObservation: " + str(observation)

    return "我尝试了几种办法，但还没有足够的信息得出结论。"
```

注意最后一行。它不是失败兜底，而是一个明确的产品选择：**允许 Agent 说「我不知道」**。

## 三个必须提前设计的东西

### 1. 停机条件

我见过最多的写法是 `while True`，然后在 prompt 里写「当你觉得完成了就输出 Final Answer」。这相当于把刹车交给乘客。

更稳妥的做法是三层停机：

- **步数上限**：硬限制，防止死循环；
- **预算上限**：token 或耗时超限就收束；
- **置信度阈值**：低于阈值时转为向用户提问。

### 2. 工具返回值的形状

工具不是越强大越好，而是越可预期越好。我的约定是：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| ok | boolean | 是否成功 |
| data | any | 成功时的结构化结果 |
| error | string | 失败原因，写给模型看 |
| retryable | boolean | 是否值得重试 |

当工具失败时，我会把错误信息整理成模型能理解的一句话，而不是把整段 traceback 塞回去。后者除了浪费 token，还会让模型误以为自己需要修复代码。

### 3. 什么时候打断自己

一个实用的小技巧：在每一步之后，让模型给当前进展打一个 0–1 的分，并附上一句「还缺什么」。

```python
progress = action.get("progress", 0)
if step >= 2 and progress < 0.2:
    return ask_user_for_clarification(question, scratchpad)
```

这比单纯增加步数有效得多。它让 Agent 在「继续瞎试」和「承认卡住」之间，选择了后者。

## 我踩过的一个坑

有一次工具调用返回了一个空列表。模型把它理解成「世界上不存在这类数据」，于是非常自信地写了一段错误结论。

后来我在工具层加了一条规则：**空结果必须附带 `empty_reason`**，例如「查询成功，但没有匹配记录」。只是这一句话，幻觉率明显下降。

## 小结

最小可用的 Agent，不是功能最少的 Agent，而是**边界最清楚的 Agent**。

- 它会做事，也会停下；
- 它会调用工具，也会报告工具失败；
- 它会在不确定的时候，把问题交还给人类。

下一步我准备把这套循环接到真实的评测集上，看看「会停下来」到底能省下多少无效调用。如果你也在写类似的循环，欢迎来留言聊聊。
