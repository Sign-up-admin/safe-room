<template>
  <footer class="footer">
    <div class="footer__divider" />
    <div class="footer__grid">
      <div>
        <p class="footer__title">法律与政策</p>
        <ul>
          <li><a href="#">法律信息</a></li>
          <li><a href="#">隐私政策</a></li>
          <li><a href="#">服务条款</a></li>
        </ul>
      </div>
      <div>
        <p class="footer__title">联系方式</p>
        <ul>
          <li>电话：400-888-8181</li>
          <li>邮箱：hi@gymtech.com</li>
          <li>地址：上海市静安区 The Future Hub</li>
        </ul>
        <div class="footer__social">
          <button aria-label="WeChat">W</button>
          <button aria-label="Weibo">B</button>
          <button aria-label="Instagram">I</button>
        </div>
      </div>
      <div>
        <p class="footer__title">加入我们</p>
        <ul>
          <li><a href="/career">教练招聘</a></li>
          <li><a href="/career">市场/行政岗位</a></li>
          <li><a href="/join">会员办理</a></li>
        </ul>
      </div>
    </div>
    <p class="footer__tagline">Stronger Every Day.</p>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  padding: 80px 6vw 60px;
  background: #020202;
  color: rgba(255, 255, 255, 0.85);

  &__divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(253, 216, 53, 0.8), transparent);
    margin-bottom: 48px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 32px;
  }

  &__title {
    color: #fdd835;
    letter-spacing: 0.2em;
    font-size: 0.85rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;

    li {
      margin-bottom: 8px;

      a {
        color: inherit;
        text-decoration: none;
      }
    }
  }

  &__social {
    margin-top: 20px;
    display: flex;
    gap: 12px;

    button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(253, 216, 53, 0.6);
      background: transparent;
      color: #fff;
      cursor: pointer;
      transition: box-shadow 0.3s ease;

      &:hover {
        box-shadow: 0 0 18px rgba(253, 216, 53, 0.6);
      }
    }
  }

  &__tagline {
    margin-top: 48px;
    text-align: center;
    font-size: 1.1rem;
    color: #fdd835;
    letter-spacing: 0.3em;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 64px 5vw 48px;
  }
}
</style>
