/*
 * ========================================
 *  博客核心逻辑 —— 无需修改，新增文章去 articles-data.js
 * ========================================
 */
(function () {
	/* 从 articles-data.js 读取全局文章数据 */
	var articles = window.uniBlogData || [];

	// ====== 首页分页参数 ======
	var currentPage = 1;      // 当前页码
	var pageSize = 6;         // 每页显示 6 篇文章卡片
	var order = "desc";       // 排序方式："desc"=最新优先 / "asc"=最早优先
	var currentCategory = null; // 当前分类过滤（null=全部）

	/* 读取 URL 参数 ?category=xxx，如果有则启用分类过滤 */
	var params = new URLSearchParams(window.location.search);
	if (params.get("category")) {
		currentCategory = decodeURIComponent(params.get("category"));
	}

	/* 根据分类过滤 + 排序，返回最终的文章列表 */
	function getFilteredArticles() {
		var list = currentCategory
			? articles.filter(function (a) { return a.category === currentCategory; })
			: articles.slice();

		list.sort(function (a, b) {
			if (order === "desc") return b.date.localeCompare(a.date);
			return a.date.localeCompare(b.date);
		});
		return list;
	}

	/* 渲染单篇文章卡片 HTML（标题、日期、分类标签、摘要） */
	function buildCardHTML(a) {
		return '<div style="text-align:left; padding:18px 30px;">'
			+ '<h3 style="margin:0 0 6px 0;"><a href="article.html?id=' + a.id + '" style="color:#333; text-decoration:none;">' + a.title + '</a></h3>'
			+ '<span style="font-size:12px; color:#999;">' + a.date + '</span>'
			+ '<span style="display:inline-block; margin-left:12px; font-size:12px; background:#f9cd90; color:#333; padding:2px 10px; border-radius:10px;">' + a.category + '</span>'
			+ '<p style="margin-top:10px; color:#666; font-size:14px; line-height:1.6;">' + a.summary + '</p>'
			+ '</div>';
	}

	/* 首页渲染：每页 6 篇文章卡片 + 排序按钮 + 分页按钮 + 分类标题 */
	function render() {
		var list = getFilteredArticles();
		var totalPages = Math.ceil(list.length / pageSize) || 1;
		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;

		var start = (currentPage - 1) * pageSize;
		var pageItems = list.slice(start, start + pageSize);

		/* 填充 6 个文章卡片容器，多余的隐藏 */
		var cards = document.querySelectorAll("#youlan .wenZhang");
		cards.forEach(function (card, i) {
			if (i < pageItems.length) {
				card.innerHTML = buildCardHTML(pageItems[i]);
				card.style.display = "block";
			} else {
				card.style.display = "none";
			}
		});

		/* 页面标题：显示分类名或"全部文章" */
		var titleEl = document.querySelector("#youlan .pageTitle");
		if (titleEl) {
			titleEl.textContent = currentCategory ? currentCategory : "全部文章";
		}

		/* 分页按钮区：排序切换 / 清除筛选 / 上下页 / 页码 / 总页数 */
		var pager = document.querySelector("#youlan .fenYeRongQi");
		if (pager) {
			var html = "";

			// 排序切换按钮
			html += '<button class="fenYeBtn" onclick="uniBlog.toggleOrder()">' + (order === "desc" ? "\u2193 最新优先" : "\u2191 最早优先") + '</button>';

			// 如果当前是分类过滤状态，显示"清除筛选"按钮
			if (currentCategory) {
				html += '<a href="index.html" class="fenYeBtn">\u2715 清除筛选</a>';
			}

			// 上一页按钮（第一页时禁用）
			html += '<button class="fenYeBtn" onclick="uniBlog.goTo(' + (currentPage - 1) + ')"' + (currentPage <= 1 ? " disabled" : "") + '>上一页</button>';

			// 页码按钮（当前页高亮）
			for (var i = 1; i <= totalPages; i++) {
				html += '<button class="fenYeBtn' + (i === currentPage ? " fenYeBtnActive" : "") + '" onclick="uniBlog.goTo(' + i + ')">' + i + '</button>';
			}

			// 下一页按钮（最后一页时禁用）
			html += '<button class="fenYeBtn" onclick="uniBlog.goTo(' + (currentPage + 1) + ')"' + (currentPage >= totalPages ? " disabled" : "") + '>下一页</button>';

			// 总页数 / 总文章数
			html += '<span style="margin-left:10px; font-size:14px; color:#999;">共 ' + totalPages + ' 页 / ' + list.length + ' 篇</span>';

			pager.innerHTML = html;
		}
	}

	// ====== ARTICLE PAGE ======
	/* 文章详情页：读取 URL 的 ?id= 参数，渲染文章标题、元信息、正文 */
	function renderArticle() {
		var paramsArticle = new URLSearchParams(window.location.search);
		var id = parseInt(paramsArticle.get("id"));
		var article = null;
		for (var i = 0; i < articles.length; i++) {
			if (articles[i].id === id) { article = articles[i]; break; }
		}

		var contentEl = document.getElementById("articleContent");
		if (!article) {
			/* 未找到对应文章，显示提示信息 */
			if (contentEl) {
				contentEl.innerHTML = '<p style="text-align:center; color:#999; padding:100px 0;">文章不存在</p>';
			}
			return;
		}

		/* 动态设置浏览器标签页标题 */
		document.title = article.title + " - 博客";

		/* 拼接 HTML：文章标题 + 日期/分类元信息 */
		var html = "<h1>" + article.title + "</h1>";
		html += '<div class="articleMeta"><span>' + article.date + '</span><span>' + article.category + '</span></div>';

		/* 遍历 content 数组，生成每个章节的 h2 标题 + p 正文 */
		for (var j = 0; j < article.content.length; j++) {
			var sec = article.content[j];
			html += '<h2 id="section-' + j + '">' + sec.heading + '</h2>';
			html += '<p>' + sec.body + '</p>';
		}

		if (contentEl) {
			contentEl.innerHTML = html;
		}

		/* 调用目录生成函数，在左侧边栏渲染导航 */
		buildTOC(article);
	}

	/* 构建左侧 sticky 目录：点击平滑滚动到对应章节 + 滚动时自动高亮当前章节 */
	function buildTOC(article) {
		var tocEl = document.getElementById("tocList");
		if (!tocEl) return;

		/* 根据文章 content 数组生成目录项列表 */
		var html = "";
		for (var i = 0; i < article.content.length; i++) {
			html += '<li><a href="#section-' + i + '" data-index="' + i + '">' + article.content[i].heading + '</a></li>';
		}
		tocEl.innerHTML = html;

		/* 点击目录项 → 平滑滚动到对应章节锚点 */
		tocEl.addEventListener("click", function (e) {
			if (e.target.tagName === "A") {
				e.preventDefault();
				var targetId = e.target.getAttribute("href").substring(1);
				var target = document.getElementById(targetId);
				if (target) {
					target.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}
		});

		/* 默认高亮第一个目录项 */
		var tocLinks = tocEl.querySelectorAll("a");
		if (tocLinks.length > 0) {
			tocLinks[0].classList.add("toc-active");
		}

		/* 监听页面滚动，检测当前可视章节并自动高亮对应目录项 */
		window.addEventListener("scroll", function () {
			var scrollPos = window.scrollY + 120; // 偏移量补偿，确保提前触发切换
			for (var i = article.content.length - 1; i >= 0; i--) {
				var heading = document.getElementById("section-" + i);
				if (heading && heading.offsetTop <= scrollPos) {
					for (var k = 0; k < tocLinks.length; k++) {
						tocLinks[k].classList.remove("toc-active");
					}
					if (tocLinks[i]) tocLinks[i].classList.add("toc-active");
					break;
				}
			}
		});
	}

	// ====== EXPORT ======
	/* 暴露到全局，供分页按钮的 onclick 调用 */
	window.uniBlog = {
		goTo: function (page) {
			currentPage = page;
			render();
			window.scrollTo({ top: 0, behavior: "smooth" }); // 切页后回到顶部
		},
		toggleOrder: function () {
			order = order === "desc" ? "asc" : "desc";
			currentPage = 1;
			render();
		}
	};

	// ====== INIT ======
	/* DOM 加载完成后自动判断当前页面类型并执行对应渲染 */
	document.addEventListener("DOMContentLoaded", function () {
		if (document.getElementById("articleContent")) {
			/* 存在 #articleContent → 是文章详情页 → 调用 renderArticle() */
			renderArticle();
		} else if (document.querySelector("#youlan")) {
			/* 存在 #youlan → 是首页 → 调用 render() */
			render();
		}
	});
})();
